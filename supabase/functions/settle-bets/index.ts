import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

function evaluateSelection(market: string, pick: string, home: number, away: number): "won" | "lost" {
  if (market === "1X2") {
    const winner = home > away ? "HOME" : home < away ? "AWAY" : "DRAW";
    return pick === winner ? "won" : "lost";
  }
  if (market === "OU25") {
    const total = home + away;
    if (pick === "OVER") return total > 2.5 ? "won" : "lost";
    return total < 2.5 ? "won" : "lost";
  }
  if (market === "BTTS") {
    const both = home > 0 && away > 0;
    if (pick === "YES") return both ? "won" : "lost";
    return both ? "lost" : "won";
  }
  return "lost";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Find all pending bets that have at least one selection on a finished match
    const { data: pendingBets } = await supabase
      .from("bets")
      .select("id, user_id, stake, total_odds, potential_payout, status")
      .eq("status", "pending");

    if (!pendingBets || pendingBets.length === 0) {
      return new Response(JSON.stringify({ ok: true, settled: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let settled = 0;
    let credited = 0;
    let pointsAwarded = 0;

    for (const bet of pendingBets) {
      const { data: selections } = await supabase
        .from("bet_selections")
        .select("id, market, pick, status, match_id")
        .eq("bet_id", bet.id);

      if (!selections || selections.length === 0) continue;

      const matchIds = selections.map((s) => s.match_id);
      const { data: matches } = await supabase
        .from("matches")
        .select("id, status, home_score, away_score")
        .in("id", matchIds);

      const matchMap = new Map((matches || []).map((m) => [m.id, m]));

      // Check if all selections can be settled
      let allDone = true;
      let anyLost = false;
      const updates: { id: string; status: string }[] = [];

      for (const sel of selections) {
        if (sel.status !== "pending") {
          if (sel.status === "lost") anyLost = true;
          continue;
        }
        const m = matchMap.get(sel.match_id);
        if (!m || m.status !== "FINISHED" || m.home_score == null || m.away_score == null) {
          allDone = false;
          continue;
        }
        const result = evaluateSelection(sel.market, sel.pick, m.home_score, m.away_score);
        updates.push({ id: sel.id, status: result });
        if (result === "lost") anyLost = true;
      }

      // Persist selection updates
      for (const u of updates) {
        await supabase.from("bet_selections").update({ status: u.status }).eq("id", u.id);
      }

      // Bet settles if any leg lost (lost) OR all legs decided (won)
      if (anyLost) {
        await supabase.from("bets").update({ status: "lost", settled_at: new Date().toISOString() }).eq("id", bet.id);
        settled++;
      } else if (allDone) {
        // All legs won
        await supabase.from("bets").update({ status: "won", settled_at: new Date().toISOString() }).eq("id", bet.id);
        // Credit wallet
        const payout = Number(bet.potential_payout);
        const { data: profile } = await supabase.from("profiles").select("balance").eq("user_id", bet.user_id).maybeSingle();
        if (profile) {
          await supabase.from("profiles").update({ balance: Number(profile.balance) + payout }).eq("user_id", bet.user_id);
          await supabase.from("wallet_transactions").insert({
            user_id: bet.user_id, type: "win", amount: payout, description: `Bet ${bet.id.slice(0, 8)} won`,
          });
          credited += payout;
        }
        // Award loyalty points: 1 point per KSH 100 staked, 2x on multibet wins
        const points = Math.floor(Number(bet.stake) / 100) * (selections.length > 1 ? 2 : 1);
        const { data: lp } = await supabase.from("loyalty_points").select("points").eq("user_id", bet.user_id).maybeSingle();
        const newPoints = (lp?.points || 0) + points;
        const tier = newPoints >= 10000 ? "Platinum" : newPoints >= 5000 ? "Gold" : newPoints >= 1000 ? "Silver" : "Bronze";
        await supabase.from("loyalty_points").upsert({ user_id: bet.user_id, points: newPoints, tier, updated_at: new Date().toISOString() });
        pointsAwarded += points;
        settled++;
      }
    }

    return new Response(JSON.stringify({ ok: true, settled, credited, pointsAwarded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
