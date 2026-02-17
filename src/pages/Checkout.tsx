import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  Check,
  Truck,
  Shield,
  Lock,
  LogIn
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/use-toast";

// Placeholder images
const productImages: Record<string, string> = {
  "premium-california-almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=80&h=80&fit=crop",
  "kashmiri-walnuts": "https://images.unsplash.com/photo-1563412885-139e4045d8a4?w=80&h=80&fit=crop",
  "jumbo-cashews": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=80&h=80&fit=crop",
  "medjool-dates": "https://images.unsplash.com/photo-1593904308143-3e5bd8c553c2?w=80&h=80&fit=crop",
  "mixed-dry-fruits-premium": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=80&h=80&fit=crop",
  "weekly-wellness-pack": "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=80&h=80&fit=crop",
  "iranian-pistachios": "https://images.unsplash.com/photo-1525706040175-5c0d0d0b3689?w=80&h=80&fit=crop",
  "dried-apricots": "https://images.unsplash.com/photo-1597371424128-8ffb9cb8cb36?w=80&h=80&fit=crop",
};

type Step = "shipping" | "payment" | "review";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthContext();
  const { items, getSubtotal, getDiscountAmount, getTotal, appliedCoupon, clearCart } = useCart();
  const { isLoading: paymentLoading, createOrder, createCodOrder, openPaymentModal, isScriptLoaded } = useRazorpay();

  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "shipping", label: "Shipping", icon: <MapPin className="h-4 w-4" /> },
    { key: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
    { key: "review", label: "Review", icon: <Package className="h-4 w-4" /> },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  const validateShipping = () => {
    const required = ["fullName", "email", "phone", "addressLine1", "city", "state", "postalCode"];
    return required.every((field) => shippingInfo[field as keyof typeof shippingInfo].trim());
  };

  const handleNextStep = () => {
    if (currentStep === "shipping") {
      if (!validateShipping()) {
        toast({
          title: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("review");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "payment") setCurrentStep("shipping");
    else if (currentStep === "review") setCurrentStep("payment");
  };

  const prepareCartItems = () => {
    return items.map((item) => {
      const itemPrice = item.isSubscription
        ? item.product.price * 0.9
        : item.product.price;

      return {
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0] || productImages[item.product.slug],
        quantity: item.quantity,
        unitPrice: itemPrice,
        totalPrice: itemPrice * item.quantity,
        isSubscription: item.isSubscription,
      };
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to complete your order.",
        variant: "destructive",
      });
      navigate("/auth?redirect=/checkout");
      return;
    }

    setIsProcessing(true);

    const cartItems = prepareCartItems();
    const total = getTotal();
    const discountAmount = getDiscountAmount();

    try {
      if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        const result = await createCodOrder({
          amount: total,
          shippingAddress: shippingInfo,
          cartItems,
          couponCode: appliedCoupon || undefined,
          discountAmount,
        });

        if (result.success && result.orderNumber) {
          clearCart();
          navigate(`/order-confirmation/${result.orderNumber}`);
        } else {
          toast({
            title: "Order Failed",
            description: result.error || "Failed to place order. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Handle Razorpay payment (card/upi)
        const orderResult = await createOrder({
          amount: total,
          shippingAddress: shippingInfo,
          cartItems,
          couponCode: appliedCoupon || undefined,
          discountAmount,
        });

        if (!orderResult.success) {
          toast({
            title: "Order Creation Failed",
            description: orderResult.error || "Failed to create order. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        // Open Razorpay payment modal
        openPaymentModal({
          razorpayKeyId: orderResult.razorpayKeyId!,
          razorpayOrderId: orderResult.razorpayOrderId!,
          orderId: orderResult.orderId!,
          amount: Math.round(total * 100), // Convert to paise
          prefill: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            contact: shippingInfo.phone,
          },
          onSuccess: (orderNumber) => {
            clearCart();
            toast({
              title: "Payment Successful",
              description: "Your order has been placed successfully!",
            });
            navigate(`/order-confirmation/${orderNumber}`);
          },
          onFailure: (error) => {
            toast({
              title: "Payment Failed",
              description: error || "Payment verification failed. Please contact support.",
              variant: "destructive",
            });
          },
        });
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checkout.</p>
          <Button asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 pb-16 bg-soft-cream">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto bg-white border-border/50 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-heading text-primary">Login to Continue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Please login or create an account to complete your checkout.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1 bg-primary text-white hover:bg-green-800">
                    <Link to="/auth?redirect=/checkout">Login</Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1 border-border text-foreground hover:bg-secondary">
                    <Link to="/auth?mode=signup&redirect=/checkout">Create Account</Link>
                  </Button>
                </div>
                <Separator />
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                  <Link to="/shop" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${index <= stepIndex
                    ? "bg-accent/10 border-accent/20 text-accent font-medium shadow-sm"
                    : "bg-white border-border text-muted-foreground"
                    }`}
                >
                  {index < stepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${index < stepIndex ? "bg-accent/40" : "bg-border"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {currentStep === "shipping" && (
                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-heading text-primary">
                        <MapPin className="h-5 w-5 text-accent" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={shippingInfo.fullName}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                            }
                            placeholder="John Doe"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-foreground">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, email: e.target.value })
                            }
                            placeholder="john@example.com"
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine1" className="text-foreground">Address Line 1 *</Label>
                        <Input
                          id="addressLine1"
                          value={shippingInfo.addressLine1}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })
                          }
                          placeholder="House/Flat No., Building Name"
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine2" className="text-foreground">Address Line 2</Label>
                        <Input
                          id="addressLine2"
                          value={shippingInfo.addressLine2}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })
                          }
                          placeholder="Street, Locality"
                          className="bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-foreground">City *</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, city: e.target.value })
                            }
                            placeholder="Mumbai"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-foreground">State *</Label>
                          <Input
                            id="state"
                            value={shippingInfo.state}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, state: e.target.value })
                            }
                            placeholder="Maharashtra"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-foreground">PIN Code *</Label>
                          <Input
                            id="postalCode"
                            value={shippingInfo.postalCode}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                            }
                            placeholder="400001"
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <Button onClick={handleNextStep} className="w-full mt-4 bg-primary text-white hover:bg-green-800">
                        Continue to Payment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {currentStep === "payment" && (
                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-heading text-primary">
                        <CreditCard className="h-5 w-5 text-accent" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value="card" id="card" className="text-primary" />
                          <Label htmlFor="card" className="flex-1 cursor-pointer">
                            <span className="font-medium text-foreground">Credit / Debit Card</span>
                            <p className="text-sm text-muted-foreground">
                              Pay securely with Razorpay
                            </p>
                          </Label>
                          <div className="flex gap-2">
                            <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">
                              VISA
                            </div>
                            <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
                          </div>
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value="upi" id="upi" className="text-primary" />
                          <Label htmlFor="upi" className="flex-1 cursor-pointer">
                            <span className="font-medium text-foreground">UPI</span>
                            <p className="text-sm text-muted-foreground">
                              Pay using Google Pay, PhonePe, Paytm via Razorpay
                            </p>
                          </Label>
                          <Badge variant="secondary" className="text-xs bg-accent/10 text-accent font-medium">Popular</Badge>
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value="cod" id="cod" className="text-primary" />
                          <Label htmlFor="cod" className="flex-1 cursor-pointer">
                            <span className="font-medium text-foreground">Cash on Delivery</span>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
                        <Lock className="h-4 w-4 text-accent" />
                        <span>
                          Your payment information is encrypted and secure
                        </span>
                      </div>

                      <div className="flex gap-4 mt-4">
                        <Button variant="outline" onClick={handlePreviousStep} className="flex-1 border-border text-foreground hover:bg-secondary">
                          Back
                        </Button>
                        <Button onClick={handleNextStep} className="flex-1 bg-primary text-white hover:bg-green-800">
                          Review Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === "review" && (
                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-heading text-primary">
                        <Package className="h-5 w-5 text-accent" />
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          Shipping Address
                        </h3>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border text-sm">
                          <p className="font-medium text-foreground">{shippingInfo.fullName}</p>
                          <p className="text-muted-foreground">{shippingInfo.addressLine1}</p>
                          {shippingInfo.addressLine2 && <p className="text-muted-foreground">{shippingInfo.addressLine2}</p>}
                          <p className="text-muted-foreground">
                            {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postalCode}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {shippingInfo.phone} • {shippingInfo.email}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                          <CreditCard className="h-4 w-4 text-primary" />
                          Payment Method
                        </h3>
                        <div className="p-3 rounded-lg bg-secondary/30 text-sm flex items-center justify-between border border-border">
                          <span className="text-foreground">
                            {paymentMethod === "card" && "Credit / Debit Card (Razorpay)"}
                            {paymentMethod === "upi" && "UPI Payment (Razorpay)"}
                            {paymentMethod === "cod" && "Cash on Delivery"}
                          </span>
                          {paymentMethod !== "cod" && (
                            <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                              <Lock className="h-3 w-3 mr-1" />
                              Secure
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground">Order Items</h3>
                        <div className="space-y-3">
                          {items.map((item) => {
                            const imageUrl =
                              item.product.images?.[0] ||
                              productImages[item.product.slug] ||
                              "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=80&h=80&fit=crop";

                            const itemPrice = item.isSubscription
                              ? item.product.price * 0.9
                              : item.product.price;

                            return (
                              <div
                                key={item.product.id}
                                className="flex gap-3 p-3 rounded-lg bg-white border border-border"
                              >
                                <img
                                  src={imageUrl}
                                  alt={item.product.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-medium line-clamp-1 text-foreground">{item.product.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                    {item.isSubscription && " • Subscribe & Save"}
                                  </p>
                                </div>
                                <p className="font-semibold text-foreground">
                                  ₹{(itemPrice * item.quantity).toFixed(0)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button variant="outline" onClick={handlePreviousStep} className="flex-1 border-border text-foreground hover:bg-secondary">
                          Back
                        </Button>
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={isProcessing || paymentLoading || (paymentMethod !== "cod" && !isScriptLoaded)}
                          className="flex-1 bg-primary text-white hover:bg-green-800"
                        >
                          {isProcessing || paymentLoading ? (
                            "Processing..."
                          ) : paymentMethod === "cod" ? (
                            "Place Order"
                          ) : (
                            "Pay Now"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-white border-border/50 shadow-sm z-30">
                <CardHeader>
                  <CardTitle className="font-heading text-primary">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items Preview */}
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item) => {
                      const itemPrice = item.isSubscription
                        ? item.product.price * 0.9
                        : item.product.price;

                      return (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate max-w-[60%]">
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="text-foreground">₹{(itemPrice * item.quantity).toFixed(0)}</span>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{getSubtotal().toFixed(0)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-accent">
                        <span className="flex items-center gap-1">
                          Discount ({appliedCoupon})
                        </span>
                        <span>-₹{getDiscountAmount().toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-primary font-medium">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg text-primary">
                    <span>Total</span>
                    <span>₹{getTotal().toFixed(0)}</span>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      Free Shipping
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Secure Payment
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
