import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const API_BASE = "https://api.football-data.org/v4/competitions/PL";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FOOTBALL_DATA_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "standings"; // "standings" | "matches"

    const endpoint =
      resource === "matches"
        ? `${API_BASE}/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED`
        : `${API_BASE}/standings`;

    const res = await fetch(endpoint, {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `Football-Data API ${res.status}: ${text}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
