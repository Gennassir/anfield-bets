import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, X } from "lucide-react";

const TEAMS = [
  { name: "Manchester City",    crest: "https://crests.football-data.org/65.svg",  odds: 10 },
  { name: "Arsenal",            crest: "https://crests.football-data.org/57.svg",  odds: 13 },
  { name: "Manchester United",  crest: "https://crests.football-data.org/66.svg",  odds: 15 },
  { name: "Liverpool",          crest: "https://crests.football-data.org/64.svg",  odds: 17 },
  { name: "Aston Villa",        crest: "https://crests.football-data.org/58.svg",  odds: 18 },
  { name: "Newcastle",          crest: "https://crests.football-data.org/67.svg",  odds: 20 },
  { name: "Tottenham",          crest: "https://crests.football-data.org/73.svg",  odds: 22 },
  { name: "Chelsea",            crest: "https://crests.football-data.org/61.svg",  odds: 5.5 },
];

interface Props {
  userId: string | null;
  balance: number;
  onPlaced: () => void;
  onRequireAuth: () => void;
}

export const ChampionPredictionModal = ({ userId, balance, onPlaced, onRequireAuth }: Props) => {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<typeof TEAMS[0] | null>(null);
  const [stake, setStake] = useState("100");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      // Show to logged-out visitors too
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
    // Check if user has placed a champion pick
    supabase.from("champion_picks").select("id").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (!data) {
          const t = setTimeout(() => setOpen(true), 1200);
          return () => clearTimeout(t);
        }
      });
  }, [userId]);

  const submit = async () => {
    if (!userId) { setOpen(false); onRequireAuth(); return; }
    if (!pick) return toast.error("Select a team");
    const amt = Number(stake);
    if (!amt || amt < 50) return toast.error("Minimum stake is KSH 50");
    if (amt > balance) return toast.error("Insufficient balance — deposit first");

    setLoading(true);
    const potential = Math.round(amt * pick.odds);

    // Deduct from balance
    const { data: prof } = await supabase.from("profiles").select("balance").eq("user_id", userId).maybeSingle();
    if (!prof || Number(prof.balance) < amt) {
      setLoading(false);
      return toast.error("Insufficient balance");
    }
    await supabase.from("profiles").update({ balance: Number(prof.balance) - amt }).eq("user_id", userId);

    // Create bet record
    const { data: bet } = await supabase.from("bets").insert({
      user_id: userId,
      bet_type: "champion",
      stake: amt,
      odds: pick.odds,
      total_odds: pick.odds,
      potential_payout: potential,
      team: pick.name,
      status: "pending",
    }).select().single();

    const { error } = await supabase.from("champion_picks").insert({
      user_id: userId,
      team: pick.name,
      stake: amt,
      odds: pick.odds,
      potential_payout: potential,
      bet_id: bet?.id,
    });

    await supabase.from("wallet_transactions").insert({
      user_id: userId, type: "bet", amount: -amt,
      description: `Champion pick · ${pick.name} ${pick.odds}`,
    });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(`Pick placed: ${pick.name} for the title!`);
    setOpen(false);
    onPlaced();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-strong border-glass-border w-[calc(100vw-1rem)] max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-50 rounded-full bg-background/80 p-2 text-foreground shadow-lg ring-1 ring-glass-border hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="pr-10">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0" />
            <span>Who will win the Premier League?</span>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs sm:text-sm text-muted-foreground -mt-2">
          Place your bet on the champion. Select your team and predict the winning side.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 mt-2">
          {TEAMS.map((t) => {
            const selected = pick?.name === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setPick(t)}
                className={`glass rounded-2xl p-3 sm:p-4 text-center transition hover:border-primary/50 ${selected ? "ring-2 ring-accent" : ""}`}
              >
                <img src={t.crest} alt={t.name} className="mx-auto h-10 w-10 sm:h-12 sm:w-12" />
                <div className="mt-2 text-xs sm:text-sm font-semibold leading-tight">{t.name}</div>
                <div className="text-xs text-accent font-bold">{t.odds.toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto]">
          <Input
            type="number"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            placeholder="Stake (KSH)"
            className="glass h-12"
          />
          <Button onClick={submit} variant="hero" size="lg" disabled={loading || !pick} className="w-full sm:w-auto">
            {loading ? "Placing…" : pick ? `Win KSH ${Math.round(Number(stake || 0) * pick.odds).toLocaleString()}` : "Pick a team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
