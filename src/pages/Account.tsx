import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  RefreshCw,
  MapPin,
  Heart,
  Star,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

// Tab components
import OrdersTab from "@/components/account/OrdersTab";
import AddressesTab from "@/components/account/AddressesTab";
import WishlistTab from "@/components/account/WishlistTab";
import ReviewsTab from "@/components/account/ReviewsTab";
import SettingsTab from "@/components/account/SettingsTab";

const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

const Account = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
                      My Account
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-fit border-border text-foreground hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Desktop Tabs */}
            <TabsList className="hidden md:flex w-full justify-start gap-2 bg-transparent h-auto p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="bg-white border-border/50 shadow-sm data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5 rounded-lg border hover:bg-secondary/50 transition-colors"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Mobile Tab Selector */}
            <div className="md:hidden grid grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${activeTab === tab.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border/50 hover:bg-secondary/50"
                    }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm mt-6">
              <TabsContent value="orders" className="mt-0">
                <OrdersTab userId={user.id} />
              </TabsContent>

              <TabsContent value="addresses" className="mt-0">
                <AddressesTab userId={user.id} />
              </TabsContent>

              <TabsContent value="wishlist" className="mt-0">
                <WishlistTab userId={user.id} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ReviewsTab userId={user.id} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsTab userId={user.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
