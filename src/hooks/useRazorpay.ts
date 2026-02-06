import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CreateOrderParams {
  amount: number;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  cartItems: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isSubscription: boolean;
  }>;
  couponCode?: string;
  discountAmount?: number;
}

interface CreateCodOrderParams {
  amount: number;
  shippingAddress: CreateOrderParams["shippingAddress"];
  cartItems: CreateOrderParams["cartItems"];
  couponCode?: string;
  discountAmount?: number;
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please refresh and try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const createOrder = useCallback(
    async (params: CreateOrderParams): Promise<{
      success: boolean;
      razorpayOrderId?: string;
      razorpayKeyId?: string;
      orderId?: string;
      orderNumber?: string;
      error?: string;
    }> => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Please login to place an order");
        }

        const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
          body: {
            amount: Math.round(params.amount * 100), // Convert to paise
            currency: "INR",
            shippingAddress: params.shippingAddress,
            cartItems: params.cartItems,
            couponCode: params.couponCode,
            discountAmount: params.discountAmount,
          },
        });

        if (error) {
          console.error("Create order error:", error);
          throw new Error(error.message || "Failed to create order");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to create order");
        }

        return {
          success: true,
          razorpayOrderId: data.razorpayOrderId,
          razorpayKeyId: data.razorpayKeyId,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
        };
      } catch (error) {
        console.error("Create order error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create order",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (
      razorpayOrderId: string,
      razorpayPaymentId: string,
      razorpaySignature: string,
      orderId: string
    ): Promise<{ success: boolean; orderNumber?: string; error?: string }> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
          body: {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            orderId,
          },
        });

        if (error) {
          console.error("Verify payment error:", error);
          throw new Error(error.message || "Payment verification failed");
        }

        if (!data.success) {
          throw new Error(data.error || "Payment verification failed");
        }

        return {
          success: true,
          orderNumber: data.orderNumber,
        };
      } catch (error) {
        console.error("Verify payment error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Payment verification failed",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createCodOrder = useCallback(
    async (params: CreateCodOrderParams): Promise<{
      success: boolean;
      orderId?: string;
      orderNumber?: string;
      error?: string;
    }> => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Please login to place an order");
        }

        const { data, error } = await supabase.functions.invoke("handle-cod-order", {
          body: {
            amount: params.amount,
            shippingAddress: params.shippingAddress,
            cartItems: params.cartItems,
            couponCode: params.couponCode,
            discountAmount: params.discountAmount,
          },
        });

        if (error) {
          console.error("COD order error:", error);
          throw new Error(error.message || "Failed to create COD order");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to create COD order");
        }

        return {
          success: true,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
        };
      } catch (error) {
        console.error("COD order error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create COD order",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const openPaymentModal = useCallback(
    (options: {
      razorpayKeyId: string;
      razorpayOrderId: string;
      orderId: string;
      amount: number;
      prefill: { name: string; email: string; contact: string };
      onSuccess: (orderNumber: string) => void;
      onFailure: (error: string) => void;
    }) => {
      if (!isScriptLoaded) {
        options.onFailure("Payment gateway not loaded. Please refresh the page.");
        return;
      }

      const razorpayOptions: RazorpayOptions = {
        key: options.razorpayKeyId,
        amount: options.amount,
        currency: "INR",
        name: "Nutriwala",
        description: "Premium Dry Fruits Order",
        order_id: options.razorpayOrderId,
        handler: async (response) => {
          const result = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            options.orderId
          );

          if (result.success && result.orderNumber) {
            options.onSuccess(result.orderNumber);
          } else {
            options.onFailure(result.error || "Payment verification failed");
          }
        },
        prefill: options.prefill,
        theme: {
          color: "#166534", // Emerald-800 for premium feel
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "Your order is saved. You can complete payment later from your orders page.",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    },
    [isScriptLoaded, verifyPayment, toast]
  );

  return {
    isLoading,
    isScriptLoaded,
    createOrder,
    createCodOrder,
    openPaymentModal,
    verifyPayment,
  };
}
