import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Supabase credentials not configured");
            return new Response(
                JSON.stringify({ success: false, error: "Database configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user from auth header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ success: false, error: "Authorization required" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid authorization" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request body
        const body = await req.json();
        const { amount, shippingAddress, cartItems, couponCode, discountAmount = 0 } = body;

        // Generate mock Razorpay order ID (for development)
        const mockRazorpayOrderId = `order_DEV${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const mockRazorpayKeyId = "rzp_test_DEVELOPMENT_MODE";

        // Generate order number
        const orderNumber = `NW${Date.now().toString().slice(-8)}`;
        const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

        // Create order in database
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
                razorpay_order_id: mockRazorpayOrderId,
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database order creation error:", dbError);
            return new Response(
                JSON.stringify({ success: false, error: "Failed to create order" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("Created database order:", dbOrder.id, "(DEVELOPMENT MODE)");

        // Insert order items
        const orderItems = cartItems.map((item: any) => ({
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
            return new Response(
                JSON.stringify({ success: false, error: "Failed to create order items" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("⚠️ DEVELOPMENT MODE: Using mock Razorpay credentials");

        return new Response(
            JSON.stringify({
                success: true,
                razorpayOrderId: mockRazorpayOrderId,
                razorpayKeyId: mockRazorpayKeyId,
                orderId: dbOrder.id,
                orderNumber: orderNumber,
                amount: amount,
                currency: "INR",
                developmentMode: true,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
