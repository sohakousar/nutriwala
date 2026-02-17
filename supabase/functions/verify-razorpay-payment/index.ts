import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";
import { createTransport } from "npm:nodemailer@6.9.10";

// --- SHARED: SECURITY ---

// Use a generic type for Supabase client to avoid strict typing issues
// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// Default rate limits for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "create-razorpay-order": { maxRequests: 10, windowSeconds: 60 },
  "verify-razorpay-payment": { maxRequests: 20, windowSeconds: 60 },
  "handle-cod-order": { maxRequests: 10, windowSeconds: 60 },
  "manage-subscription": { maxRequests: 30, windowSeconds: 60 },
  default: { maxRequests: 100, windowSeconds: 3600 },
};

// Get client IP from request headers
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Get user agent from request
export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

// Check rate limit using database function
export async function checkRateLimit(
  supabase: AnySupabaseClient,
  identifier: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<boolean> {
  const limits = config || RATE_LIMITS[endpoint] || RATE_LIMITS.default;

  try {
    // Use raw SQL query since the function might not be in generated types
    const { data, error } = await supabase
      .rpc("check_rate_limit", {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_max_requests: limits.maxRequests,
        p_window_seconds: limits.windowSeconds,
      } as unknown as undefined);

    if (error) {
      console.error("Rate limit check error:", error);
      // Fail open - allow request if rate limit check fails
      return true;
    }

    return data === true;
  } catch (error) {
    console.error("Rate limit exception:", error);
    return true;
  }
}

// Log an audit event
export async function logAuditEvent(
  supabase: AnySupabaseClient,
  event: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: event.userId || null,
        action: event.action,
        entity_type: event.entityType,
        entity_id: event.entityId || null,
        old_values: event.oldValues || null,
        new_values: event.newValues || null,
        ip_address: event.ipAddress || null,
        user_agent: event.userAgent || null,
        metadata: event.metadata || null,
      });

    if (error) {
      console.error("Audit log error:", error);
    }
  } catch (error) {
    console.error("Audit log exception:", error);
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Create error response
export function errorResponse(
  message: string,
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Create success response
export function successResponse(
  data: Record<string, unknown>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Verify user authentication
export async function verifyAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ user: { id: string; email?: string } | null; error: string | null }> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return { user: null, error: "Authorization required" };
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");

  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Invalid authorization" };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

// --- SHARED: EMAIL ---

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
  is_subscription?: boolean;
}

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  discountAmount?: number;
}

export const sendOrderConfirmationEmail = async (order: OrderDetails) => {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
    console.error("SMTP credentials not set. Skipping email sending.");
    return { success: false, error: "Missing SMTP Credentials" };
  }

  const transporter = createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; width: 72px;">
        ${item.product_image
          ? `<img src="${item.product_image}" alt="${item.product_name}" width="64" height="64" style="width: 64px; height: 64px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; display: block;">`
          : `<div style="width: 64px; height: 64px; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb; text-align: center; line-height: 64px; font-size: 24px;">&#128230;</div>`
        }
      </td>
      <td style="padding: 12px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <p style="margin: 0; font-weight: 700; color: #111827; font-size: 14px; line-height: 1.4;">${item.product_name}</p>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Qty: ${item.quantity}</p>
        ${item.is_subscription ? `<span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-top: 4px; text-transform: uppercase;">Subscription</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: right; white-space: nowrap;">
        <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">&#8377;${item.total_price.toFixed(0)}</p>
      </td>
    </tr>
        `
    )
    .join("");

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
        <!--[if mso]>
        <style type="text/css">
            body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
        <![endif]-->
        <style type="text/css">
            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; }
                .content-padding { padding: 20px !important; }
                .info-cell { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F0F4F1; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

        <!-- Outer wrapper table -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F4F1;">
            <tr>
                <td align="center" style="padding: 24px 16px;">

                    <!-- Email container -->
                    <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">

                        <!-- Header -->
                        <tr>
                            <td style="background-color: #166534; padding: 32px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-family: Georgia, serif; font-size: 30px; font-weight: 700; font-style: italic; letter-spacing: -0.5px;">Nutriwala</h1>
                            </td>
                        </tr>

                        <!-- Greeting -->
                        <tr>
                            <td class="content-padding" style="padding: 40px 32px 32px; text-align: center; border-bottom: 3px solid #e8f0e8;">
                                <table role="presentation" width="64" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
                                    <tr>
                                        <td style="width: 64px; height: 64px; background-color: #e8f0e8; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 28px; color: #166534;">&#10003;</td>
                                    </tr>
                                </table>
                                <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #111827;">Order Confirmed!</h2>
                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    Thank you for shopping with us, <strong style="color: #111827;">${order.customerName}</strong>.<br>Your organic goodies are being picked and will be on their way shortly.
                                </p>
                            </td>
                        </tr>

                        <!-- Info Grid -->
                        <tr>
                            <td class="content-padding" style="padding: 28px 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td class="info-cell" style="width: 50%; padding-bottom: 20px; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Order #</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${order.orderNumber}</p>
                                        </td>
                                        <td class="info-cell" style="width: 50%; padding-bottom: 20px; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${formattedDate}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-cell" style="width: 50%; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Payment</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${order.paymentMethod}</p>
                                        </td>
                                        <td class="info-cell" style="width: 50%; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827; word-break: break-all;">${order.customerEmail}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Items Header -->
                        <tr>
                            <td style="padding: 0 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center;">
                                            <p style="margin: 0; font-family: Georgia, serif; color: #166534; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Items Ordered</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Items List -->
                        <tr>
                            <td class="content-padding" style="padding: 16px 32px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    ${itemsHtml}
                                </table>
                            </td>
                        </tr>

                        <!-- Order Summary Header -->
                        <tr>
                            <td style="background-color: #f0f4f1; padding: 10px 32px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                            </td>
                        </tr>

                        <!-- Order Summary Content -->
                        <tr>
                            <td class="content-padding" style="padding: 20px 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    ${order.discountAmount
      ? `<tr>
                                        <td style="padding-bottom: 8px; font-size: 14px; color: #6b7280;">Subtotal</td>
                                        <td style="padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #111827; text-align: right;">&#8377;${(order.totalAmount + order.discountAmount).toFixed(0)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px; font-size: 14px; color: #166534; font-weight: 500;">Discount</td>
                                        <td style="padding-bottom: 12px; font-size: 14px; font-weight: 500; color: #166534; text-align: right;">-&#8377;${order.discountAmount.toFixed(0)}</td>
                                    </tr>`
      : ''
    }
                                    <tr>
                                        <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #111827;">Grand Total</td>
                                        <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 22px; font-weight: 700; color: #166534; text-align: right;">&#8377;${order.totalAmount.toFixed(0)}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Shipping Address -->
                        <tr>
                            <td class="content-padding" style="padding: 0 32px 28px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4f1; border-left: 4px solid #166534; border-radius: 2px;">
                                    <tr>
                                        <td style="padding: 16px; width: 32px; vertical-align: top; font-size: 18px;">&#128666;</td>
                                        <td style="padding: 16px 16px 16px 0; vertical-align: top;">
                                            <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px;">Shipping To</p>
                                            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                                                ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br>
                                                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- CTA Button -->
                        <tr>
                            <td class="content-padding" style="padding: 0 32px 36px; text-align: center;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="background-color: #166534; border-radius: 4px;">
                                            <a href="https://nutriwala.vercel.app/orders" target="_blank" style="display: block; padding: 16px 32px; color: #ffffff; font-weight: 600; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
                                                View Order Details
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 28px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 12px; font-size: 12px; color: #9ca3af;">
                                    Need help? <a href="mailto:support@nutriwala.com" style="color: #166534; font-weight: 500; text-decoration: underline;">Contact Support</a>
                                </p>
                                <p style="margin: 0; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6;">
                                    &copy; ${new Date().getFullYear()} Nutriwala Inc.<br>
                                    Premium Dry Fruits &amp; Healthy Snacks
                                </p>
                            </td>
                        </tr>

                    </table>
                    <!-- End email container -->

                </td>
            </tr>
        </table>
        <!-- End outer wrapper -->

    </body>
    </html>
  `;



  try {
    const info = await transporter.sendMail({
      from: `Nutriwala Orders <${SENDER_EMAIL || SMTP_USERNAME}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: html,
    });

    console.log("Email sent successfully:", info);
    return { success: true, data: info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

// --- MAIN FUNCTION ---

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!RAZORPAY_KEY_SECRET) {
      console.error("Razorpay key secret not configured");
      return errorResponse("Payment configuration error", 500);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("Supabase credentials not configured");
      return errorResponse("Database configuration error", 500);
    }

    // Verify user authentication
    const { user, error: authError } = await verifyAuth(req, SUPABASE_URL, SUPABASE_ANON_KEY);
    if (authError || !user) {
      return errorResponse(authError || "Authorization required", 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const rateLimitAllowed = await checkRateLimit(
      supabaseAdmin,
      user.id,
      "verify-razorpay-payment"
    );

    if (!rateLimitAllowed) {
      console.log("Rate limit exceeded for user:", user.id);
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const body: VerifyPaymentRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    console.log("Verifying payment for order:", orderId, "razorpay_order:", razorpay_order_id);

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return errorResponse("Missing required payment verification fields", 400);
    }

    // Validate orderId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return errorResponse("Invalid order ID format", 400);
    }

    // Generate expected signature
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hmac = createHmac("sha256", RAZORPAY_KEY_SECRET);
    hmac.update(signaturePayload);
    const expectedSignature = hmac.digest("hex");

    // Verify signature using timing-safe comparison
    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Payment signature verification failed for order:", orderId);

      // Log failed verification attempt
      await logAuditEvent(supabaseAdmin, {
        userId: user.id,
        action: "PAYMENT_VERIFICATION_FAILED",
        entityType: "order",
        entityId: orderId,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
          reason: "signature_mismatch",
        },
        ipAddress: clientIP,
        userAgent: userAgent,
      });

      return errorResponse("Payment verification failed - signature mismatch", 400);
    }

    console.log("Signature verified successfully");

    // Update order status in database
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq("id", orderId)
      .eq("user_id", user.id) // Ensure user owns this order
      .select("order_number, total")
      .single();

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return errorResponse("Failed to update order status", 500);
    }

    console.log("Order updated successfully:", updatedOrder.order_number);

    // Log successful payment
    await logAuditEvent(supabaseAdmin, {
      userId: user.id,
      action: "PAYMENT_VERIFIED",
      entityType: "order",
      entityId: orderId,
      newValues: {
        orderNumber: updatedOrder.order_number,
        paymentStatus: "paid",
        razorpay_payment_id,
        amount: updatedOrder.total,
      },
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    // Send order confirmation email
    console.log("Sending order confirmation email...");
    try {
      // Fetch full order details including shipping address and items
      const { data: fullOrder, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select(`
          order_number,
          shipping_address,
          total,
          discount_amount,
          order_items (
            product_name,
            quantity,
            unit_price,
            total_price,
            product_image,
            is_subscription
          )
        `)
        .eq("id", orderId)
        .single();

      if (!fetchError && fullOrder) {
        await sendOrderConfirmationEmail({
          orderNumber: fullOrder.order_number,
          customerName: (fullOrder.shipping_address as any).fullName,
          customerEmail: (fullOrder.shipping_address as any).email,
          shippingAddress: fullOrder.shipping_address as any,
          items: fullOrder.order_items.map((item: any) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            product_image: item.product_image,
            is_subscription: item.is_subscription,
          })),
          totalAmount: fullOrder.total,
          paymentMethod: "Online Payment (Razorpay)",
          discountAmount: fullOrder.discount_amount,
        });
      } else {
        console.error("Failed to fetch order details for email:", fetchError);
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return successResponse({
      success: true,
      message: "Payment verified successfully",
      orderNumber: updatedOrder.order_number,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return errorResponse("Internal server error", 500);
  }
});
