
// ==========================================
// SHARED UTILITIES (Bundled for Dashboard)
// ==========================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.10";

// --- SECURITY.TS ---
type AnySupabaseClient = SupabaseClient<any, any, any>;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "handle-cod-order": { maxRequests: 10, windowSeconds: 60 },
  default: { maxRequests: 100, windowSeconds: 3600 },
};

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

async function checkRateLimit(
  supabase: AnySupabaseClient,
  identifier: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<boolean> {
  const limits = config || RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  try {
    const { data, error } = await supabase
      .rpc("check_rate_limit", {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_max_requests: limits.maxRequests,
        p_window_seconds: limits.windowSeconds,
      } as unknown as undefined);
    if (error) {
      console.error("Rate limit check error:", error);
      return true;
    }
    return data === true;
  } catch (error) {
    console.error("Rate limit exception:", error);
    return true;
  }
}

async function logAuditEvent(
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
    if (error) console.error("Audit log error:", error);
  } catch (error) {
    console.error("Audit log exception:", error);
  }
}

function errorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function successResponse(data: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ user: { id: string; email?: string } | null; error: string | null }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { user: null, error: "Authorization required" };
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) return { user: null, error: "Invalid authorization" };
  return { user: { id: user.id, email: user.email }, error: null };
}

// --- VALIDATION.TS ---
interface AddressInput {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateAddress(address: AddressInput): ValidationResult {
  const errors: string[] = [];
  if (!address.fullName || address.fullName.trim().length < 2) errors.push("Full name must be at least 2 characters");
  if (address.fullName && address.fullName.length > 100) errors.push("Full name must be less than 100 characters");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!address.email || !emailRegex.test(address.email)) errors.push("Invalid email address");
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  if (!address.phone || !phoneRegex.test(address.phone) || address.phone.length < 10) errors.push("Invalid phone number");
  if (!address.addressLine1 || address.addressLine1.trim().length < 5) errors.push("Address line 1 must be at least 5 characters");
  if (!address.city || address.city.trim().length < 2) errors.push("City must be at least 2 characters");
  if (!address.state || address.state.trim().length < 2) errors.push("State must be at least 2 characters");
  const postalRegex = /^[1-9][0-9]{5}$/;
  if (!address.postalCode || !postalRegex.test(address.postalCode)) errors.push("Invalid postal code (6 digits required)");
  return { valid: errors.length === 0, errors };
}

interface CartItemInput {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isSubscription: boolean;
}

function validateCartItems(items: CartItemInput[]): ValidationResult {
  const errors: string[] = [];
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("Cart must contain at least one item");
    return { valid: false, errors };
  }
  if (items.length > 50) {
    errors.push("Cart cannot contain more than 50 items");
    return { valid: false, errors };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  items.forEach((item, index) => {
    if (!item.productId || !uuidRegex.test(item.productId)) errors.push(`Item ${index + 1}: Invalid product ID`);
    if (!item.productName || item.productName.trim().length < 1) errors.push(`Item ${index + 1}: Product name is required`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) errors.push(`Item ${index + 1}: Quantity must be between 1 and 100`);
    if (typeof item.unitPrice !== "number" || item.unitPrice < 0 || item.unitPrice > 1000000) errors.push(`Item ${index + 1}: Invalid unit price`);
    if (typeof item.totalPrice !== "number" || item.totalPrice < 0) errors.push(`Item ${index + 1}: Invalid total price`);
  });
  return { valid: errors.length === 0, errors };
}

function validateAmount(amount: number, minAmount = 100, maxAmount = 10000000): ValidationResult {
  const errors: string[] = [];
  if (typeof amount !== "number" || isNaN(amount)) errors.push("Amount must be a valid number");
  else if (amount < minAmount) errors.push(`Amount must be at least ₹${minAmount / 100}`);
  else if (amount > maxAmount) errors.push(`Amount cannot exceed ₹${maxAmount / 100}`);
  else if (!Number.isInteger(amount)) errors.push("Amount must be a whole number (in paise)");
  return { valid: errors.length === 0, errors };
}

function validateCouponCode(code: string | undefined): ValidationResult {
  const errors: string[] = [];
  if (code !== undefined && code !== null) {
    if (typeof code !== "string") errors.push("Coupon code must be a string");
    else if (code.length > 50) errors.push("Coupon code too long");
    else if (!/^[A-Z0-9_-]*$/i.test(code)) errors.push("Coupon code contains invalid characters");
  }
  return { valid: errors.length === 0, errors };
}

// --- EMAIL.TS (SMTP VERSION) ---
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

const sendOrderConfirmationEmail = async (order: OrderDetails) => {
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

// ==========================================
// MAIN FUNCTION (handle-cod-order)
// ==========================================

interface CodOrderRequest {
  amount: number;
  shippingAddress: AddressInput;
  cartItems: CartItemInput[];
  couponCode?: string;
  discountAmount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("Supabase credentials not configured");
      return errorResponse("Database configuration error", 500);
    }

    const { user, error: authError } = await verifyAuth(req, SUPABASE_URL, SUPABASE_ANON_KEY);
    if (authError || !user) {
      return errorResponse(authError || "Authorization required", 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rateLimitAllowed = await checkRateLimit(
      supabaseAdmin,
      user.id,
      "handle-cod-order"
    );

    if (!rateLimitAllowed) {
      console.log("Rate limit exceeded for user:", user.id);
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    let body: CodOrderRequest;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    const { amount, shippingAddress, cartItems, couponCode, discountAmount = 0 } = body;

    const amountInPaise = amount * 100;
    const amountValidation = validateAmount(amountInPaise);
    if (!amountValidation.valid) return errorResponse(amountValidation.errors.join(", "), 400);

    const addressValidation = validateAddress(shippingAddress);
    if (!addressValidation.valid) return errorResponse(addressValidation.errors.join(", "), 400);

    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.valid) return errorResponse(cartValidation.errors.join(", "), 400);

    if (couponCode) {
      const couponValidation = validateCouponCode(couponCode);
      if (!couponValidation.valid) return errorResponse(couponValidation.errors.join(", "), 400);
    }

    console.log("Creating COD order for user:", user.id, "amount:", amount);

    const orderNumber = `NW${Date.now().toString().slice(-8)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const { data: dbOrder, error: dbError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "confirmed",
        payment_status: "pending",
        payment_method: "cod",
        shipping_address: shippingAddress,
        subtotal: subtotal,
        discount_amount: discountAmount,
        coupon_code: couponCode || null,
        total: amount,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database order creation error:", dbError);
      return errorResponse("Failed to create order", 500);
    }

    console.log("Created COD order:", dbOrder.id, "Order number:", orderNumber);

    const orderItems = cartItems.map((item) => ({
      order_id: dbOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      is_subscription: item.isSubscription,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
      await supabaseAdmin.from("orders").delete().eq("id", dbOrder.id);
      return errorResponse("Failed to create order items", 500);
    }

    await logAuditEvent(supabaseAdmin, {
      userId: user.id,
      action: "COD_ORDER_CREATED",
      entityType: "order",
      entityId: dbOrder.id,
      newValues: {
        orderNumber,
        amount,
        paymentMethod: "cod",
        itemCount: cartItems.length,
      },
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    // Send email
    console.log("Sending order confirmation email...");
    try {
      await sendOrderConfirmationEmail({
        orderNumber,
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        shippingAddress,
        items: cartItems.map((item) => ({
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          product_image: item.productImage,
          is_subscription: item.isSubscription,
        })),
        totalAmount: amount,
        paymentMethod: "Cash on Delivery",
        discountAmount,
      });
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    return successResponse({
      success: true,
      orderId: dbOrder.id,
      orderNumber: orderNumber,
    });
  } catch (error) {
    console.error("Error creating COD order:", error);
    return errorResponse("Internal server error", 500);
  }
});
