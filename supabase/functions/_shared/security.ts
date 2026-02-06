import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Use a generic type for Supabase client to avoid strict typing issues
// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// Default rate limits for different endpoints
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "create-razorpay-order": { maxRequests: 10, windowSeconds: 60 },
  "verify-razorpay-payment": { maxRequests: 20, windowSeconds: 60 },
  "handle-cod-order": { maxRequests: 10, windowSeconds: 60 },
  "manage-subscription": { maxRequests: 30, windowSeconds: 60 },
  default: { maxRequests: 100, windowSeconds: 3600 },
};

// Get client IP from request headers
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Get user agent from request
export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

// Check rate limit using database function
export async function checkRateLimit(
  supabase: AnySupabaseClient,
  identifier: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<boolean> {
  const limits = config || RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  
  try {
    // Use raw SQL query since the function might not be in generated types
    const { data, error } = await supabase
      .rpc("check_rate_limit", {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_max_requests: limits.maxRequests,
        p_window_seconds: limits.windowSeconds,
      } as unknown as undefined);

    if (error) {
      console.error("Rate limit check error:", error);
      // Fail open - allow request if rate limit check fails
      return true;
    }

    return data === true;
  } catch (error) {
    console.error("Rate limit exception:", error);
    return true;
  }
}

// Log an audit event
export async function logAuditEvent(
  supabase: AnySupabaseClient,
  event: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: event.userId || null,
        action: event.action,
        entity_type: event.entityType,
        entity_id: event.entityId || null,
        old_values: event.oldValues || null,
        new_values: event.newValues || null,
        ip_address: event.ipAddress || null,
        user_agent: event.userAgent || null,
        metadata: event.metadata || null,
      });

    if (error) {
      console.error("Audit log error:", error);
    }
  } catch (error) {
    console.error("Audit log exception:", error);
  }
}

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") return sanitizeString(item);
        if (typeof item === "object" && item !== null) {
          return sanitizeObject(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate phone number (basic)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 20;
}

// Validate Indian postal code
export function isValidPostalCode(postalCode: string): boolean {
  const postalRegex = /^[1-9][0-9]{5}$/;
  return postalRegex.test(postalCode);
}

// Create error response
export function errorResponse(
  message: string,
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Create success response
export function successResponse(
  data: Record<string, unknown>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Verify user authentication
export async function verifyAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ user: { id: string; email?: string } | null; error: string | null }> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { user: null, error: "Authorization required" };
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Invalid authorization" };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

// Check if user is admin
export async function isAdmin(
  supabase: AnySupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_admin", {
      user_uuid: userId,
    } as unknown as undefined);

    if (error) {
      console.error("Admin check error:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Admin check exception:", error);
    return false;
  }
}
