import { useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  RefreshCw,
  Shield,
  LogOut,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
];

function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-primary">
              Nutri<span className="text-accent">wala</span>
            </span>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
              Admin
            </span>
          </Link>
        )}
        <SidebarTrigger className={cn("ml-auto", collapsed && "mx-auto")} />
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Store">
                  <Link to="/">
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back to Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();

  const isLoading = authLoading || adminLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please login to access the admin panel.",
        });
        navigate("/auth");
      } else if (isAdmin === false) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
        });
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b bg-card">
            <SidebarTrigger className="h-10 w-10" />
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-primary">
                Nutri<span className="text-accent">wala</span>
              </span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                Admin
              </span>
            </Link>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
