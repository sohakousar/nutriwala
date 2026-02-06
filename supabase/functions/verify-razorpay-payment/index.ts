import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";
import {
  corsHeaders,
  checkRateLimit,
  logAuditEvent,
  getClientIP,
  getUserAgent,
  errorResponse,
  successResponse,
  verifyAuth,
} from "../_shared/security.ts";

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
