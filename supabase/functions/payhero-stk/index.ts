// PayHero STK Push initiator
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYHERO_BASE = "https://backend.payhero.co.ke/api/v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (uErr || !user) return json({ error: "Unauthorized" }, 401);

    const { phone, amount, type = "deposit" } = await req.json();
    const amt = Number(amount);
    const minAmt = type === "deposit" ? 100 : 100;
    if (!amt || amt < minAmt) return json({ error: `Minimum ${type} is KSH ${minAmt}` }, 400);
    if (!/^(?:\+?254|0)?(7\d{8})$/.test(String(phone))) return json({ error: "Invalid phone" }, 400);

    // Normalize to 2547XXXXXXXX
    const normalized = String(phone).replace(/^(\+?254|0)/, "254");

    // For withdraw, validate balance
    if (type === "withdraw") {
      const { data: prof } = await supabase
        .from("profiles").select("balance").eq("user_id", user.id).maybeSingle();
      const bal = Number(prof?.balance ?? 0);
      if (bal < amt) return json({ error: "Insufficient balance" }, 400);
    }

    // Block duplicate pending requests within the last 30s (matches client timeout).
    // Cancelled / failed / success rows do NOT block — users can retry immediately.
    const { data: pendingDup } = await supabase
      .from("stk_requests")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 30_000).toISOString())
      .limit(1);
    if (pendingDup && pendingDup.length > 0) {
      return json({ error: "You already have an M-Pesa prompt in progress. Check your phone or wait a few seconds." }, 429);
    }

    const externalRef = `ANFIELD BETS-${Date.now()}-${user.id.slice(0, 8)}`;
    const callbackUrl = Deno.env.get("PAYHERO_CALLBACK_URL")!;
    const channelId = Number(Deno.env.get("PAYHERO_CHANNEL_ID")!);
    const basicAuth = Deno.env.get("PAYHERO_BASIC_AUTH_TOKEN")!;

    // Insert pending stk_request
    const { data: stk, error: insErr } = await supabase
      .from("stk_requests")
      .insert({
        user_id: user.id,
        phone: normalized,
        amount: amt,
        type,
        external_reference: externalRef,
      })
      .select()
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    const endpoint = type === "withdraw" ? "/withdraw" : "/payments";
    const payload = type === "withdraw"
      ? {
          external_reference: externalRef,
          amount: amt,
          phone_number: normalized,
          network_code: "63902",
          callback_url: callbackUrl,
          channel: "mobile",
          channel_id: channelId,
          payment_service: "b2c",
        }
      : {
          amount: amt,
          phone_number: normalized,
          channel_id: channelId,
          provider: "m-pesa",
          external_reference: externalRef,
          customer_name: "ANFIELD BETS",
          callback_url: callbackUrl,
        };

    const resp = await fetch(`${PAYHERO_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth,
      },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    console.log("PayHero response:", JSON.stringify(result));

    if (!resp.ok) {
      await supabase.from("stk_requests").update({
        status: "failed",
        result_desc: result.error_message || result.message || "PayHero rejected",
        raw_callback: result,
      }).eq("id", stk.id);
      return json({ error: result.error_message || result.message || "STK push failed" }, 400);
    }

    await supabase.from("stk_requests").update({
      payhero_reference: result.reference || result.CheckoutRequestID,
      checkout_request_id: result.CheckoutRequestID,
    }).eq("id", stk.id);

    return json({
      success: true,
      message: type === "withdraw"
        ? "Withdrawal initiated. You'll receive M-Pesa confirmation shortly."
        : "Check your phone and enter M-Pesa PIN to complete deposit.",
      stk_id: stk.id,
      external_reference: externalRef,
    });
  } catch (e) {
    console.error("payhero-stk error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
