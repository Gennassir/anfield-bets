import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

// APIFootball.com - English Premier League league_id = 152
const API_BASE = "https://apiv3.apifootball.com/";
const EPL_LEAGUE_ID = "152";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("APIFOOTBALL_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "APIFOOTBALL_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "standings"; // "standings" | "matches"

    let endpoint: string;
    if (resource === "matches") {
      // Get fixtures for the next 14 days
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + 14);
      const from = today.toISOString().split("T")[0];
      const to = future.toISOString().split("T")[0];
      endpoint = `${API_BASE}?action=get_events&from=${from}&to=${to}&league_id=${EPL_LEAGUE_ID}&APIkey=${apiKey}`;
    } else {
      endpoint = `${API_BASE}?action=get_standings&league_id=${EPL_LEAGUE_ID}&APIkey=${apiKey}`;
    }

    const res = await fetch(endpoint);

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `APIFootball ${res.status}: ${text}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await res.json();

    // APIFootball returns { error: 'message' } as object on errors
    if (raw && !Array.isArray(raw) && raw.error) {
      return new Response(JSON.stringify({ error: raw.message || "APIFootball error", raw }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize to the shape the frontend already expects
    if (resource === "matches") {
      const matches = (raw as any[]).map((m) => ({
        id: Number(m.match_id),
        utcDate: `${m.match_date}T${m.match_time || "00:00"}:00Z`,
        status:
          m.match_status === "" ? "SCHEDULED" :
          m.match_status === "Finished" ? "FINISHED" :
          /^\d+$/.test(m.match_status) ? "IN_PLAY" : "SCHEDULED",
        homeTeam: {
          id: Number(m.match_hometeam_id),
          name: m.match_hometeam_name,
          shortName: m.match_hometeam_name,
          tla: (m.match_hometeam_name || "").slice(0, 3).toUpperCase(),
          crest: m.team_home_badge || "",
        },
        awayTeam: {
          id: Number(m.match_awayteam_id),
          name: m.match_awayteam_name,
          shortName: m.match_awayteam_name,
          tla: (m.match_awayteam_name || "").slice(0, 3).toUpperCase(),
          crest: m.team_away_badge || "",
        },
        score: {
          fullTime: {
            home: m.match_hometeam_score === "" ? null : Number(m.match_hometeam_score),
            away: m.match_awayteam_score === "" ? null : Number(m.match_awayteam_score),
          },
        },
      }));
      return new Response(JSON.stringify({ matches }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
      });
    } else {
      const table = (raw as any[]).map((s) => ({
        position: Number(s.overall_league_position),
        team: {
          id: Number(s.team_id),
          name: s.team_name,
          shortName: s.team_name,
          tla: (s.team_name || "").slice(0, 3).toUpperCase(),
          crest: s.team_badge || "",
        },
        playedGames: Number(s.overall_league_payed),
        won: Number(s.overall_league_W),
        draw: Number(s.overall_league_D),
        lost: Number(s.overall_league_L),
        points: Number(s.overall_league_PTS),
        goalsFor: Number(s.overall_league_GF),
        goalsAgainst: Number(s.overall_league_GA),
        goalDifference: Number(s.overall_league_GF) - Number(s.overall_league_GA),
        form: "",
      }));
      return new Response(JSON.stringify({ standings: [{ table }] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
