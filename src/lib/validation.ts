import { z } from "zod";

// Reusable validation schemas for frontend

// Email validation
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email is too long");

// Phone validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number")
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number is too long");

// Indian postal code
export const postalCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Invalid postal code (6 digits required)");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters");

// Address schema
export const addressSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address is too long"),
  addressLine2: z.string().max(200, "Address is too long").optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(100, "City name is too long"),
  state: z.string().min(2, "State must be at least 2 characters").max(100, "State name is too long"),
  postalCode: postalCodeSchema,
  country: z.string().default("India"),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .max(128, "Password is too long");

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Signup form schema
export const signupFormSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupFormSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Review form schema
export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  title: z.string().max(200, "Title is too long").optional(),
  comment: z.string().max(2000, "Review is too long").optional(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// Coupon code validation
export const couponCodeSchema = z
  .string()
  .max(50, "Coupon code is too long")
  .regex(/^[A-Z0-9_-]+$/i, "Invalid coupon code format")
  .transform((val) => val.toUpperCase());

// Quantity validation
export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(100, "Quantity cannot exceed 100");

// Product ID validation (UUID)
export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Invalid ID format"
  );

// Search query validation
export const searchQuerySchema = z
  .string()
  .max(200, "Search query is too long")
  .transform((val) => val.trim());

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

// Validate and sanitize object
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeFormData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
