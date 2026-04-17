import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbMatch {
  id: number;
  home_team: string;
  away_team: string;
  home_crest: string | null;
  away_crest: string | null;
  kickoff: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  odds_home: number;
  odds_draw: number;
  odds_away: number;
  odds_over25: number;
  odds_under25: number;
  odds_btts_yes: number;
  odds_btts_no: number;
}

export const useMatches = (filter?: "live" | "upcoming" | "all") => {
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("matches").select("*").order("kickoff", { ascending: true }).limit(50);
    if (filter === "live") q = q.eq("status", "IN_PLAY");
    else if (filter === "upcoming") q = q.eq("status", "SCHEDULED").gte("kickoff", new Date().toISOString());
    const { data } = await q;
    setMatches((data as DbMatch[]) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("matches-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return { matches, loading, reload: load };
};
