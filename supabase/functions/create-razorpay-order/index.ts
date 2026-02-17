import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
import {
  validateAddress,
  validateCartItems,
  validateAmount,
  validateCouponCode,
  type AddressInput,
  type CartItemInput,
} from "../_shared/validation.ts";

interface CreateOrderRequest {
  amount: number;
  currency?: string;
  shippingAddress: AddressInput;
  cartItems: CartItemInput[];
  couponCode?: string;
  discountAmount?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not configured");
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
      "create-razorpay-order"
    );

    if (!rateLimitAllowed) {
      console.log("Rate limit exceeded for user:", user.id);
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    // Parse and sanitize request body
    let body: CreateOrderRequest;
    try {
      const rawBody = await req.json();
      body = rawBody as CreateOrderRequest;
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    const { amount, currency = "INR", shippingAddress, cartItems, couponCode, discountAmount = 0 } = body;

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return errorResponse(amountValidation.errors.join(", "), 400);
    }

    // Validate shipping address
    const addressValidation = validateAddress(shippingAddress);
    if (!addressValidation.valid) {
      return errorResponse(addressValidation.errors.join(", "), 400);
    }

    // Validate cart items
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.valid) {
      return errorResponse(cartValidation.errors.join(", "), 400);
    }

    // Validate coupon code if provided
    if (couponCode) {
      const couponValidation = validateCouponCode(couponCode);
      if (!couponValidation.valid) {
        return errorResponse(couponValidation.errors.join(", "), 400);
      }
    }

    console.log("Creating Razorpay order for user:", user.id, "amount:", amount);

    // Generate order number
    const orderNumber = `NW${Date.now().toString().slice(-8)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create order in database first (with pending status)
    const { data: dbOrder, error: dbError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        payment_method: "razorpay",
        shipping_address: shippingAddress,
        subtotal: subtotal,
        discount_amount: discountAmount,
        coupon_code: couponCode || null,
        total: amount / 100, // Convert paise to rupees for storage
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database order creation error:", dbError);
      return errorResponse("Failed to create order", 500);
    }

    console.log("Created database order:", dbOrder.id);

    // Insert order items
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
      // Rollback: delete the order
      await supabaseAdmin.from("orders").delete().eq("id", dbOrder.id);
      return errorResponse("Failed to create order items", 500);
    }

    // Create Razorpay order
    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount, // Amount in paise
        currency,
        receipt: orderNumber,
        notes: {
          order_id: dbOrder.id,
          user_id: user.id,
        },
      }),
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay API error:", razorpayData);
      // Rollback database changes
      await supabaseAdmin.from("order_items").delete().eq("order_id", dbOrder.id);
      await supabaseAdmin.from("orders").delete().eq("id", dbOrder.id);
      return errorResponse(razorpayData.error?.description || "Payment gateway error", 502);
    }

    console.log("Created Razorpay order:", razorpayData.id);

    // Update the database order with Razorpay order ID
    await supabaseAdmin
      .from("orders")
      .update({ razorpay_order_id: razorpayData.id })
      .eq("id", dbOrder.id);

    // Log audit event
    await logAuditEvent(supabaseAdmin, {
      userId: user.id,
      action: "ORDER_CREATED",
      entityType: "order",
      entityId: dbOrder.id,
      newValues: {
        orderNumber,
        amount: amount / 100,
        paymentMethod: "razorpay",
        itemCount: cartItems.length,
      },
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    return successResponse({
      success: true,
      razorpayOrderId: razorpayData.id,
      razorpayKeyId: RAZORPAY_KEY_ID,
      orderId: dbOrder.id,
      orderNumber: orderNumber,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return errorResponse("Internal server error", 500);
  }
});
