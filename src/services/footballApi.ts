import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

async function callEdge(resource: "standings" | "matches") {
  const { data, error } = await supabase.functions.invoke("epl-data", {
    method: "GET",
    // pass as query string via body workaround: use fetch directly
  });
  if (error) throw error;
  return data;
}

// We need query params, so call the function URL directly
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epl-data`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchEdge(resource: "standings" | "matches") {
  const res = await fetch(`${FN_URL}?resource=${resource}`, {
    headers: { Authorization: `Bearer ${ANON}`, apikey: ANON },
  });
  if (!res.ok) throw new Error(`Edge function ${res.status}`);
  return res.json();
}

class FootballApiService {
  async getPremierLeagueStandings(): Promise<Standing[]> {
    const data = await fetchEdge("standings");
    return data.standings?.[0]?.table || [];
  }

  async getPremierLeagueMatches(): Promise<Match[]> {
    const data = await fetchEdge("matches");
    return data.matches || [];
  }
}

export const footballApi = new FootballApiService();
