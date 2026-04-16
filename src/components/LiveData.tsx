import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Standing = {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalDifference: number;
  points: number;
};

type Match = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string; tla: string; crest: string };
  awayTeam: { name: string; tla: string; crest: string };
  score: { fullTime: { home: number | null; away: number | null } };
};

export const LiveData = () => {
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([
        supabase.functions.invoke("epl-data", { body: null, method: "GET" as never }).then(() =>
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epl-data?resource=standings`,
            { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
          ).then((r) => r.json())
        ),
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epl-data?resource=matches`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
        ).then((r) => r.json()),
      ]);
      if (s?.error) throw new Error(s.error);
      setStandings(s?.standings?.[0]?.table ?? []);
      setMatches((m?.matches ?? []).slice(0, 12));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 60_000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">Live EPL Data</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}

      <Tabs defaultValue="table">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">League Table</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-3">
          {!standings ? (
            <SkeletonRows />
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-card/80 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">GD</TableHead>
                    <TableHead className="text-right">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((row) => (
                    <TableRow key={row.team.id}>
                      <TableCell className="font-bold text-muted-foreground">{row.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={row.team.crest} alt="" className="h-5 w-5" />
                          <span className="text-xs font-medium">{row.team.shortName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs">{row.playedGames}</TableCell>
                      <TableCell className="text-center text-xs">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</TableCell>
                      <TableCell className="text-right font-bold text-accent">{row.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fixtures" className="mt-3">
          {!matches ? (
            <SkeletonRows />
          ) : matches.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No upcoming fixtures.</div>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-card/40 p-3">
                  <div className="flex items-center gap-2">
                    <img src={m.homeTeam.crest} alt="" className="h-5 w-5" />
                    <span className="text-xs font-medium">{m.homeTeam.tla}</span>
                  </div>
                  <div className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                    {m.status === "IN_PLAY" || m.status === "LIVE" ? (
                      <span className="text-accent">{m.score.fullTime.home ?? 0} - {m.score.fullTime.away ?? 0} · LIVE</span>
                    ) : (
                      new Date(m.utcDate).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{m.awayTeam.tla}</span>
                    <img src={m.awayTeam.crest} alt="" className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SkeletonRows = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />
    ))}
  </div>
);
