// Validation schemas and utilities for edge functions

// Address validation schema
export interface AddressInput {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validate address input
export function validateAddress(address: AddressInput): ValidationResult {
  const errors: string[] = [];

  // Full name
  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }
  if (address.fullName && address.fullName.length > 100) {
    errors.push("Full name must be less than 100 characters");
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!address.email || !emailRegex.test(address.email)) {
    errors.push("Invalid email address");
  }

  // Phone
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  if (!address.phone || !phoneRegex.test(address.phone) || address.phone.length < 10) {
    errors.push("Invalid phone number");
  }

  // Address line 1
  if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
    errors.push("Address line 1 must be at least 5 characters");
  }

  // City
  if (!address.city || address.city.trim().length < 2) {
    errors.push("City must be at least 2 characters");
  }

  // State
  if (!address.state || address.state.trim().length < 2) {
    errors.push("State must be at least 2 characters");
  }

  // Postal code (Indian format)
  const postalRegex = /^[1-9][0-9]{5}$/;
  if (!address.postalCode || !postalRegex.test(address.postalCode)) {
    errors.push("Invalid postal code (6 digits required)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Cart item validation
export interface CartItemInput {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isSubscription: boolean;
}

export function validateCartItems(items: CartItemInput[]): ValidationResult {
  const errors: string[] = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("Cart must contain at least one item");
    return { valid: false, errors };
  }

  if (items.length > 50) {
    errors.push("Cart cannot contain more than 50 items");
    return { valid: false, errors };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  items.forEach((item, index) => {
    if (!item.productId || !uuidRegex.test(item.productId)) {
      errors.push(`Item ${index + 1}: Invalid product ID`);
    }
    if (!item.productName || item.productName.trim().length < 1) {
      errors.push(`Item ${index + 1}: Product name is required`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      errors.push(`Item ${index + 1}: Quantity must be between 1 and 100`);
    }
    if (typeof item.unitPrice !== "number" || item.unitPrice < 0 || item.unitPrice > 1000000) {
      errors.push(`Item ${index + 1}: Invalid unit price`);
    }
    if (typeof item.totalPrice !== "number" || item.totalPrice < 0) {
      errors.push(`Item ${index + 1}: Invalid total price`);
    }
    // Verify total price calculation
    const expectedTotal = item.unitPrice * item.quantity;
    if (Math.abs(item.totalPrice - expectedTotal) > 1) {
      errors.push(`Item ${index + 1}: Total price calculation mismatch`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Amount validation
export function validateAmount(amount: number, minAmount = 100, maxAmount = 10000000): ValidationResult {
  const errors: string[] = [];

  if (typeof amount !== "number" || isNaN(amount)) {
    errors.push("Amount must be a valid number");
  } else if (amount < minAmount) {
    errors.push(`Amount must be at least ₹${minAmount / 100}`);
  } else if (amount > maxAmount) {
    errors.push(`Amount cannot exceed ₹${maxAmount / 100}`);
  } else if (!Number.isInteger(amount)) {
    errors.push("Amount must be a whole number (in paise)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Coupon code validation
export function validateCouponCode(code: string | undefined): ValidationResult {
  const errors: string[] = [];

  if (code !== undefined && code !== null) {
    if (typeof code !== "string") {
      errors.push("Coupon code must be a string");
    } else if (code.length > 50) {
      errors.push("Coupon code too long");
    } else if (!/^[A-Z0-9_-]*$/i.test(code)) {
      errors.push("Coupon code contains invalid characters");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Subscription validation
export interface SubscriptionInput {
  productId: string;
  planType: "weekly" | "bi-weekly" | "monthly";
  quantity: number;
  shippingAddressId?: string;
}

export function validateSubscription(sub: SubscriptionInput): ValidationResult {
  const errors: string[] = [];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!sub.productId || !uuidRegex.test(sub.productId)) {
    errors.push("Invalid product ID");
  }

  if (!["weekly", "bi-weekly", "monthly"].includes(sub.planType)) {
    errors.push("Plan type must be weekly, bi-weekly, or monthly");
  }

  if (!Number.isInteger(sub.quantity) || sub.quantity < 1 || sub.quantity > 10) {
    errors.push("Quantity must be between 1 and 10");
  }

  if (sub.shippingAddressId && !uuidRegex.test(sub.shippingAddressId)) {
    errors.push("Invalid shipping address ID");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
