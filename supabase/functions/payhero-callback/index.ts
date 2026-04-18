// PayHero callback receiver — public endpoint (no JWT)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    console.log("PayHero callback:", JSON.stringify(body));

    const resp = body.response || body;
    const externalRef: string | undefined = resp.ExternalReference || resp.external_reference;
    const checkoutId: string | undefined = resp.CheckoutRequestID;
    const resultCode = resp.ResultCode ?? resp.Status;
    const success =
      resultCode === 0 || resultCode === "0" || String(resp.Status).toLowerCase() === "success";
    const mpesaReceipt = resp.MpesaReceiptNumber || resp.mpesa_receipt;
    const desc = resp.ResultDesc || resp.message || "";

    let query = supabase.from("stk_requests").select("*").limit(1);
    if (externalRef) query = query.eq("external_reference", externalRef);
    else if (checkoutId) query = query.eq("checkout_request_id", checkoutId);

    const { data: stkRows } = await query;
    const stk = stkRows?.[0];
    if (!stk) {
      console.warn("No matching stk_request for ref", externalRef, checkoutId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stk.status !== "pending") {
      return new Response(JSON.stringify({ ok: true, already: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("stk_requests").update({
      status: success ? "success" : "failed",
      mpesa_receipt: mpesaReceipt,
      result_desc: desc,
      raw_callback: body,
    }).eq("id", stk.id);

    if (success) {
      const { data: prof } = await supabase
        .from("profiles").select("balance").eq("user_id", stk.user_id).maybeSingle();
      const currentBal = Number(prof?.balance ?? 0);
      const delta = stk.type === "withdraw" ? -Number(stk.amount) : Number(stk.amount);
      const newBal = currentBal + delta;

      await supabase.from("profiles").update({ balance: newBal }).eq("user_id", stk.user_id);
      await supabase.from("wallet_transactions").insert({
        user_id: stk.user_id,
        type: stk.type === "withdraw" ? "withdraw" : "deposit",
        amount: delta,
        description: `M-Pesa ${stk.type} · ${stk.phone}${mpesaReceipt ? ` · ${mpesaReceipt}` : ""}`,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("callback error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
