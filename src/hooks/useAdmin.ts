import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export const useIsAdmin = () => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
      const todayStr = new Date().toISOString().split('T')[0];

      // Get orders stats (exclude pending/incomplete orders)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, total, status, payment_status, created_at')
        .neq('status', 'pending');

      const { data: monthOrders } = await supabase
        .from('orders')
        .select('id, total')
        .neq('status', 'pending')
        .gte('created_at', startOfMonth);

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, total')
        .neq('status', 'pending')
        .gte('created_at', todayStr);

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      // Get categories count
      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get customers count (profiles)
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Calculate revenue
      const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.payment_status === 'paid' ? Number(o.total) : 0), 0) || 0;
      const monthRevenue = monthOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const todayRevenue = todayOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      // Order status breakdown
      const pendingOrders = allOrders?.filter(o => o.status === 'pending').length || 0;
      const processingOrders = allOrders?.filter(o => o.status === 'processing').length || 0;
      const shippedOrders = allOrders?.filter(o => o.status === 'shipped').length || 0;
      const deliveredOrders = allOrders?.filter(o => o.status === 'delivered').length || 0;

      return {
        totalOrders: allOrders?.length || 0,
        monthOrders: monthOrders?.length || 0,
        todayOrders: todayOrders?.length || 0,
        totalRevenue,
        monthRevenue,
        todayRevenue,
        productsCount: productsCount || 0,
        categoriesCount: categoriesCount || 0,
        activeSubscriptions: activeSubscriptions || 0,
        customersCount: customersCount || 0,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      };
    },
    staleTime: 60 * 1000, // Refresh every minute
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .neq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all orders
      if (orders && orders.length > 0) {
        const userIds = [...new Set(orders.map(o => o.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', userIds);

        // Map profiles to orders
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        return orders.map(order => ({
          ...order,
          user_profile: profileMap.get(order.user_id) || null
        }));
      }

      return orders;
    },
  });
};

export const useAdminCustomers = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for profiles
  useEffect(() => {
    const channel = supabase
      .channel('admin-customers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Get all profiles with user data from auth.users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get order counts for each customer
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id')
        .neq('status', 'pending');

      // Count orders per customer
      const orderCounts: Record<string, number> = {};
      orders?.forEach(order => {
        orderCounts[order.user_id] = (orderCounts[order.user_id] || 0) + 1;
      });

      // Combine profiles with order counts
      const customersWithOrders = profiles?.map(profile => ({
        ...profile,
        order_count: orderCounts[profile.user_id] || 0
      }));

      return customersWithOrders;
    },
    refetchInterval: 30000, // Also refetch every 30 seconds as backup
  });
};


export const useTopSellingProducts = () => {
  return useQuery({
    queryKey: ['top-selling-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity
        `);

      if (error) throw error;

      // Aggregate by product
      const productSales: Record<string, { name: string; quantity: number }> = {};
      data?.forEach((item) => {
        if (item.product_id) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: item.product_name, quantity: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
        }
      });

      // Sort and return top 5
      return Object.entries(productSales)
        .map(([id, { name, quantity }]) => ({ id, name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
  });
};

export const useRevenueByDay = (days: number = 30) => {
  return useQuery({
    queryKey: ['revenue-by-day', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, payment_status')
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const revenueByDate: Record<string, number> = {};
      data?.forEach((order) => {
        const date = order.created_at.split('T')[0];
        revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.total);
      });

      // Fill in missing dates
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          revenue: revenueByDate[dateStr] || 0,
        });
      }

      return result;
    },
  });
};

export const useAdminReviews = () => {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (name, slug, images)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const userIds = [...new Set(reviews.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Return with explicit typing or cast to any to allow user_profile
        return reviews.map(review => ({
          ...review,
          user_profile: profileMap.get(review.user_id) || null
        })) as any[];
      }

      return reviews as any[];
    },
  });
};
