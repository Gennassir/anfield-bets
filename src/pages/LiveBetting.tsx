import { useEffect, useState } from "react";
import { Radio, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import Navigation from "@/components/Navigation";
import { useMatches, DbMatch } from "@/hooks/useMatches";
import { BetSlip } from "@/components/BetSlip";
import { BetSelection, Market, Pick, pickLabel } from "@/lib/betting";

const LiveBetting = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState(100);
  const [placing, setPlacing] = useState(false);
  const { matches, loading } = useMatches("all");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase.from("profiles").select("balance").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => data && setBalance(Number(data.balance)));
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in for live betting</h2>
            <p className="text-muted-foreground mb-6">Sign in to place real bets on EPL matches</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  const addSelection = (m: DbMatch, market: Market, pick: Pick, odds: number) => {
    setSelections((prev) => {
      const filtered = prev.filter((s) => !(s.matchId === m.id && s.market === market));
      // Prevent two markets of same type on same match — one selection per match per market
      return [...filtered, {
        matchId: m.id,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        market, pick, odds,
        label: pickLabel(market, pick),
      }];
    });
  };

  const removeSelection = (matchId: number, market: string) => {
    setSelections((prev) => prev.filter((s) => !(s.matchId === matchId && s.market === market)));
  };

  const placeBet = async () => {
    if (!session?.user) return;
    if (stake < 100) return toast.error("Min stake KSH 100");
    if (stake > balance) return toast.error("Insufficient balance");
    if (selections.length === 0) return;

    setPlacing(true);
    const totalOdds = selections.reduce((p, s) => p * Number(s.odds), 1);
    const potential = stake * totalOdds;
    const betType = selections.length > 1 ? "multi" : "single";

    const { data: bet, error } = await supabase.from("bets").insert({
      user_id: session.user.id,
      stake,
      odds: totalOdds,
      total_odds: totalOdds,
      potential_payout: potential,
      bet_type: betType,
      team: selections.map((s) => s.homeTeam.slice(0, 3)).join("/"),
      predicted_points: selections.length,
      status: "pending",
    }).select().single();

    if (error || !bet) { setPlacing(false); return toast.error(error?.message || "Failed"); }

    const { error: selErr } = await supabase.from("bet_selections").insert(
      selections.map((s) => ({
        bet_id: bet.id, match_id: s.matchId, market: s.market, pick: s.pick, odds: s.odds,
      }))
    );
    if (selErr) { setPlacing(false); return toast.error(selErr.message); }

    await supabase.from("wallet_transactions").insert({
      user_id: session.user.id, type: "bet", amount: -stake,
      description: `${betType === "multi" ? "Multibet" : "Single"} · ${selections.length} selection(s)`,
    });
    await supabase.from("profiles").update({ balance: balance - stake }).eq("user_id", session.user.id);

    toast.success(`Bet placed! Potential payout KSH ${potential.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    setSelections([]);
    setBalance((b) => b - stake);
    setPlacing(false);
  };

  const liveMatches = matches.filter((m) => m.status === "IN_PLAY");
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="sticky top-16 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Radio className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">Live & Upcoming</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="live-dot" /> Real EPL odds · Wallet KSH {balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <main className="container py-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            {loading && <div className="text-center text-muted-foreground py-12">Loading matches…</div>}

            {liveMatches.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><span className="live-dot" /> Live now</h2>
                <div className="space-y-3 mb-8">
                  {liveMatches.map((m) => <MatchCard key={m.id} match={m} selections={selections} onAdd={addSelection} live />)}
                </div>
              </>
            )}

            <h2 className="text-xl font-semibold mb-3">Upcoming fixtures</h2>
            <div className="space-y-3">
              {upcoming.length === 0 && !loading ? (
                <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
                  No upcoming fixtures right now. Sync runs every 10 minutes.
                </div>
              ) : (
                upcoming.map((m) => <MatchCard key={m.id} match={m} selections={selections} onAdd={addSelection} />)
              )}
            </div>
          </section>

          <BetSlip
            selections={selections}
            stake={stake}
            onStakeChange={setStake}
            onRemove={removeSelection}
            onPlace={placeBet}
            placing={placing}
            balance={balance}
          />
        </main>
      </div>
    </div>
  );
};

const MatchCard = ({ match, selections, onAdd, live }: {
  match: DbMatch;
  selections: BetSelection[];
  onAdd: (m: DbMatch, market: Market, pick: Pick, odds: number) => void;
  live?: boolean;
}) => {
  const isSelected = (market: Market, pick: Pick) =>
    selections.some((s) => s.matchId === match.id && s.market === market && s.pick === pick);

  const OddsBtn = ({ market, pick, odds, label }: { market: Market; pick: Pick; odds: number; label: string }) => (
    <Button
      size="sm"
      variant={isSelected(market, pick) ? "default" : "outline"}
      onClick={() => onAdd(match, market, pick, odds)}
      className="flex-col h-auto py-1.5 min-w-[60px]"
    >
      <span className="text-[9px] uppercase opacity-70">{label}</span>
      <span className="text-sm font-bold">{Number(odds).toFixed(2)}</span>
    </Button>
  );

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {live ? (
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
            </span>
          ) : (
            <span>{new Date(match.kickoff).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          )}
        </div>
        {live && (match.home_score != null) && (
          <div className="text-lg font-bold">{match.home_score} - {match.away_score}</div>
        )}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.home_crest && <img src={match.home_crest} alt="" className="h-6 w-6" />}
          <span className="text-sm font-semibold">{match.home_team}</span>
        </div>
        <span className="text-xs text-muted-foreground">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{match.away_team}</span>
          {match.away_crest && <img src={match.away_crest} alt="" className="h-6 w-6" />}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">1X2</span>
          <div className="flex gap-1.5">
            <OddsBtn market="1X2" pick="HOME" odds={match.odds_home} label="1" />
            <OddsBtn market="1X2" pick="DRAW" odds={match.odds_draw} label="X" />
            <OddsBtn market="1X2" pick="AWAY" odds={match.odds_away} label="2" />
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">O/U 2.5</span>
          <div className="flex gap-1.5">
            <OddsBtn market="OU25" pick="OVER" odds={match.odds_over25} label="Over" />
            <OddsBtn market="OU25" pick="UNDER" odds={match.odds_under25} label="Under" />
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">BTTS</span>
          <div className="flex gap-1.5">
            <OddsBtn market="BTTS" pick="YES" odds={match.odds_btts_yes} label="Yes" />
            <OddsBtn market="BTTS" pick="NO" odds={match.odds_btts_no} label="No" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBetting;
