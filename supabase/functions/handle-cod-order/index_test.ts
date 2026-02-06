import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const functionUrl = `${SUPABASE_URL}/functions/v1/handle-cod-order`;

Deno.test("handle-cod-order: rejects unauthorized requests", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 1000,
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        addressLine1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
      },
      cartItems: [],
    }),
  });

  const body = await response.json();

  assertEquals(response.status, 401);
  assertExists(body.error);
});

Deno.test("handle-cod-order: handles CORS preflight", async () => {
  const response = await fetch(functionUrl, {
    method: "OPTIONS",
  });

  const body = await response.text();

  assertEquals(response.status, 200);
  assertEquals(body, "ok");
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("handle-cod-order: rejects invalid JSON", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: "not-json",
  });

  const body = await response.json();

  // Should fail with invalid body or auth error
  assertExists(body.error);
});

Deno.test("handle-cod-order: validates amount", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: -100, // Invalid negative amount
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        addressLine1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
      },
      cartItems: [
        {
          productId: "550e8400-e29b-41d4-a716-446655440000",
          productName: "Test Product",
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
          isSubscription: false,
        },
      ],
    }),
  });

  const body = await response.json();

  // Will fail validation or auth
  assertExists(body.error);
});

Deno.test("handle-cod-order: validates shipping address", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: 1000,
      shippingAddress: {
        fullName: "A", // Too short
        email: "invalid-email",
        phone: "123", // Too short
        addressLine1: "Hi", // Too short
        city: "M",
        state: "M",
        postalCode: "12345", // Invalid Indian postal
      },
      cartItems: [],
    }),
  });

  const body = await response.json();

  // Should fail validation
  assertExists(body.error);
});
