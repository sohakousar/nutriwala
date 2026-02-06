import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subscriptionId, action } = await req.json();

    if (!subscriptionId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing subscriptionId or action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify subscription belongs to user
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !subscription) {
      return new Response(
        JSON.stringify({ success: false, error: "Subscription not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updates: Record<string, any> = {};
    let message = "";

    switch (action) {
      case "pause":
        updates = { status: "paused" };
        message = "Subscription paused successfully";
        break;

      case "resume":
        // Calculate new next delivery date when resuming
        const frequencyDays: Record<string, number> = {
          weekly: 7,
          "bi-weekly": 14,
          monthly: 30,
        };
        const days = frequencyDays[subscription.plan_type] || 30;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        
        updates = { 
          status: "active",
          next_delivery_date: nextDate.toISOString().split("T")[0]
        };
        message = "Subscription resumed successfully";
        break;

      case "cancel":
        updates = { status: "cancelled" };
        message = "Subscription cancelled successfully";
        break;

      case "skip":
        const skipDays: Record<string, number> = {
          weekly: 7,
          "bi-weekly": 14,
          monthly: 30,
        };
        const skip = skipDays[subscription.plan_type] || 30;
        const currentNext = new Date(subscription.next_delivery_date);
        currentNext.setDate(currentNext.getDate() + skip);
        
        updates = { next_delivery_date: currentNext.toISOString().split("T")[0] };
        message = "Next delivery skipped successfully";
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        subscription: { ...subscription, ...updates }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Subscription management error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
