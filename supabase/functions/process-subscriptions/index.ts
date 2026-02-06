import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRenewal {
  subscriptionId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  userId: string;
  planType: string;
  shippingAddressId: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // This function processes subscriptions due for renewal
    // It should be called periodically (e.g., via a cron job)
    
    const today = new Date().toISOString().split("T")[0];
    
    // Get all active subscriptions due today or overdue
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        plan_type,
        next_delivery_date,
        shipping_address_id,
        products (
          id,
          name,
          price,
          images
        )
      `)
      .eq("status", "active")
      .lte("next_delivery_date", today);

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No subscriptions due for renewal",
          processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { success: boolean; subscriptionId: string; error?: string }[] = [];

    for (const subscription of dueSubscriptions) {
      try {
        const product = subscription.products as any;
        if (!product) {
          results.push({ 
            success: false, 
            subscriptionId: subscription.id, 
            error: "Product not found" 
          });
          continue;
        }

        // Calculate subscription discount (10%)
        const discountMultiplier = 0.9;
        const unitPrice = product.price * discountMultiplier;
        const totalPrice = unitPrice * subscription.quantity;

        // Generate order number
        const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Get shipping address
        let shippingAddress = {
          full_name: "Subscription Customer",
          address_line1: "Address on file",
          city: "City",
          state: "State",
          postal_code: "000000",
          phone: "0000000000",
        };

        if (subscription.shipping_address_id) {
          const { data: address } = await supabase
            .from("addresses")
            .select("*")
            .eq("id", subscription.shipping_address_id)
            .single();
          
          if (address) {
            shippingAddress = {
              full_name: address.full_name,
              address_line1: address.address_line1 + (address.address_line2 ? `, ${address.address_line2}` : ""),
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              phone: address.phone,
            };
          }
        } else {
          // Try to get default address for user
          const { data: defaultAddress } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", subscription.user_id)
            .eq("is_default", true)
            .single();

          if (defaultAddress) {
            shippingAddress = {
              full_name: defaultAddress.full_name,
              address_line1: defaultAddress.address_line1 + (defaultAddress.address_line2 ? `, ${defaultAddress.address_line2}` : ""),
              city: defaultAddress.city,
              state: defaultAddress.state,
              postal_code: defaultAddress.postal_code,
              phone: defaultAddress.phone,
            };
          }
        }

        // Create the order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: subscription.user_id,
            order_number: orderNumber,
            subtotal: totalPrice,
            discount_amount: product.price * subscription.quantity * 0.1, // 10% discount
            shipping_amount: 0, // Free shipping for subscriptions
            tax_amount: 0,
            total: totalPrice,
            status: "pending",
            payment_status: "pending", // In production, this would trigger payment
            shipping_address: shippingAddress,
            notes: `Subscription renewal - ${subscription.plan_type}`,
          })
          .select()
          .single();

        if (orderError) {
          throw new Error(`Failed to create order: ${orderError.message}`);
        }

        // Create order item
        const { error: itemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            product_id: product.id,
            product_name: product.name,
            product_image: product.images?.[0] || null,
            quantity: subscription.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            is_subscription: true,
          });

        if (itemError) {
          throw new Error(`Failed to create order item: ${itemError.message}`);
        }

        // Calculate next delivery date based on plan type
        const frequencyDays: Record<string, number> = {
          weekly: 7,
          "bi-weekly": 14,
          monthly: 30,
        };
        
        const days = frequencyDays[subscription.plan_type] || 30;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        const nextDeliveryDate = nextDate.toISOString().split("T")[0];

        // Update subscription with new delivery dates
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            last_delivery_date: today,
            next_delivery_date: nextDeliveryDate,
          })
          .eq("id", subscription.id);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        results.push({ success: true, subscriptionId: subscription.id });
        
        console.log(`Subscription ${subscription.id} renewed. Order ${orderNumber} created.`);
      } catch (error: any) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        results.push({ 
          success: false, 
          subscriptionId: subscription.id, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} subscriptions`,
        processed: successCount,
        failed: failCount,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Subscription renewal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
