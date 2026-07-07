import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const PLANS = {
  monthly: { amount: 14900, days: 30 },
  annual: { amount: 99900, days: 365 },
} as const;

type Plan = keyof typeof PLANS;

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ plan: z.enum(["monthly", "annual"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Payments not configured");

    const plan = data.plan as Plan;
    const { amount } = PLANS[plan];
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        notes: { user_id: context.userId, plan },
      }),
    });
    if (!res.ok) {
      console.error("Razorpay order create failed", await res.text().catch(() => ""));
      throw new Error("Could not create payment order");
    }
    const order = (await res.json()) as {
      id: string;
      amount: number;
      currency: string;
    };
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        plan: z.enum(["monthly", "annual"]),
        razorpay_order_id: z.string().min(1).max(200),
        razorpay_payment_id: z.string().min(1).max(200),
        razorpay_signature: z.string().min(1).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Payments not configured");

    // HMAC verification per Razorpay spec: hmac_sha256(order_id|payment_id, secret)
    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Invalid payment signature");
    }

    // Confirm with Razorpay that the payment is actually captured/authorized
    // and belongs to this order — prevents replay with a random signed payload.
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error("Payments not configured");
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const payRes = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(data.razorpay_payment_id)}`,
      { headers: { Authorization: `Basic ${basicAuth}` } },
    );
    if (!payRes.ok) throw new Error("Could not verify payment with Razorpay");
    const payment = (await payRes.json()) as {
      status: string;
      order_id: string;
      amount: number;
    };
    if (payment.order_id !== data.razorpay_order_id) {
      throw new Error("Payment does not match order");
    }
    if (payment.status !== "captured" && payment.status !== "authorized") {
      throw new Error(`Payment not completed (status: ${payment.status})`);
    }
    const plan = data.plan as Plan;
    if (payment.amount !== PLANS[plan].amount) {
      throw new Error("Payment amount does not match plan");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Dedupe: prevent double application of the same payment id.
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("razorpay_payment_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (
      existing &&
      (existing as any).razorpay_payment_id === data.razorpay_payment_id
    ) {
      return { alreadyApplied: true };
    }

    const days = PLANS[plan].days;
    const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_premium: true,
        premium_plan: plan,
        premium_expires_at: expiresAt,
        razorpay_payment_id: data.razorpay_payment_id,
      } as any)
      .eq("id", context.userId);
    if (error) {
      console.error("Premium activation write failed", error);
      throw new Error("Activation failed");
    }
    return { alreadyApplied: false, expiresAt };
  });
