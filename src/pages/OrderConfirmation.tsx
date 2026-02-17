import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package, Truck, Mail, ArrowRight, Home, Loader2, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_subscription: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number | null;
  total: number;
  coupon_code: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
}

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

      if (error) throw error;
      return data as unknown as Order;
    },
    enabled: !!orderNumber,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", order?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order!.id);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!order?.id,
  });

  const steps = [
    { icon: CheckCircle2, label: "Order Confirmed", active: true },
    { icon: Package, label: "Processing", active: order?.status === "processing" || order?.status === "shipped" || order?.status === "delivered" },
    { icon: Truck, label: "Shipped", active: order?.status === "shipped" || order?.status === "delivered" },
    { icon: Home, label: "Delivered", active: order?.status === "delivered" },
  ];

  const getPaymentStatusBadge = () => {
    switch (order?.payment_status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Paid</Badge>;
      case "cod_pending":
        return <Badge variant="secondary">Pay on Delivery</Badge>;
      case "pending":
        return <Badge variant="outline">Payment Pending</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-4 text-foreground">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find order {orderNumber}. Please check your order number.
            </p>
            <Button asChild className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
              <Link to="/account?tab=orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const shippingAddress = order.shipping_address;

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="h-12 w-12 text-accent" />
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
                Thank You for Your Order!
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                Your order has been successfully placed.
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-muted-foreground">
                  Order Number: <span className="font-semibold text-foreground">{orderNumber}</span>
                </p>
                {getPaymentStatusBadge()}
              </div>
            </div>

            {/* Order Progress */}
            <Card className="mb-8 bg-white border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  {steps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center relative flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${step.active
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "bg-secondary text-muted-foreground border border-border"
                          }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${step.active ? "text-primary font-medium" : "text-muted-foreground"
                          }`}
                      >
                        {step.label}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-5 left-[60%] w-[80%] h-0.5 ${step.active && steps[index + 1].active ? "bg-accent/50" : "bg-border"
                            }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Shipping Address */}
              <Card className="bg-white border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Home className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-primary">Shipping Address</h3>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                    <p className="pt-1">{shippingAddress.phone}</p>
                    <p>{shippingAddress.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card className="bg-white border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-primary">Order Information</h3>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="capitalize text-foreground">{order.payment_method?.replace("_", " ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date</span>
                      <span className="text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery</span>
                      <span className="text-foreground">3-5 Business Days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            {orderItems && orderItems.length > 0 && (
              <Card className="mb-8 bg-white border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img
                          src={item.product_image || "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=80&h=80&fit=crop"}
                          alt={item.product_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.unit_price.toFixed(0)}
                            {item.is_subscription && " • Subscription"}
                          </p>
                        </div>
                        <p className="font-semibold">₹{item.total_price.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{order.subtotal.toFixed(0)}</span>
                    </div>
                    {order.discount_amount && order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-accent">
                        <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                        <span>-₹{order.discount_amount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-accent">Free</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{order.total.toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-green-800 shadow-md">
                <Link to="/shop" className="gap-2">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-border text-foreground hover:bg-secondary">
                <Link to="/account?tab=orders">View All Orders</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
