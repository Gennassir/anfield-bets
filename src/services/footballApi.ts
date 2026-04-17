import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  venue?: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  referees?: Array<{ id: number; name: string; type: string; nationality: string }>;
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

  async getTodayMatches(): Promise<Match[]> {
    const all = await this.getPremierLeagueMatches();
    const today = new Date().toISOString().split("T")[0];
    return all.filter((m) => m.utcDate.startsWith(today));
  }

  async getLiveMatches(): Promise<Match[]> {
    const all = await this.getPremierLeagueMatches();
    return all.filter((m) => m.status === "IN_PLAY" || m.status === "LIVE");
  }

  async getPremierLeagueTeams(): Promise<Team[]> {
    const standings = await this.getPremierLeagueStandings();
    return standings.map((s) => s.team);
  }
}

export const footballApi = new FootballApiService();
