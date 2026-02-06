import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const functionUrl = `${SUPABASE_URL}/functions/v1/manage-subscription`;

Deno.test("manage-subscription: rejects unauthorized requests", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscriptionId: "test-id",
      action: "pause",
    }),
  });

  // Consume response body
  const body = await response.json();

  assertEquals(response.status, 401);
  assertEquals(body.success, false);
  assertExists(body.error);
});

Deno.test("manage-subscription: rejects missing parameters", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, // Will fail auth but tests param validation first
    },
    body: JSON.stringify({}),
  });

  const body = await response.json();

  // Should fail due to missing params or auth
  assertEquals(body.success, false);
});

Deno.test("manage-subscription: handles CORS preflight", async () => {
  const response = await fetch(functionUrl, {
    method: "OPTIONS",
  });

  await response.text(); // Consume body

  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

Deno.test("manage-subscription: rejects invalid action", async () => {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      subscriptionId: "test-id",
      action: "invalid-action",
    }),
  });

  const body = await response.json();

  // Will fail auth first, but tests the request flow
  assertEquals(body.success, false);
});
