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

interface CodOrderRequest {
  amount: number;
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

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
      "handle-cod-order"
    );

    if (!rateLimitAllowed) {
      console.log("Rate limit exceeded for user:", user.id);
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    // Parse request body
    let body: CodOrderRequest;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    const { amount, shippingAddress, cartItems, couponCode, discountAmount = 0 } = body;

    // Validate amount (COD amount is in rupees, not paise)
    const amountInPaise = amount * 100;
    const amountValidation = validateAmount(amountInPaise);
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

    console.log("Creating COD order for user:", user.id, "amount:", amount);

    // Generate order number
    const orderNumber = `NW${Date.now().toString().slice(-8)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create order in database
    const { data: dbOrder, error: dbError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "confirmed",
        payment_status: "cod_pending",
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

    // Log audit event
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
