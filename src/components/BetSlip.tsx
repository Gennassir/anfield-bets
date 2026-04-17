import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Receipt } from "lucide-react";
import { BetSelection, pickLabel } from "@/lib/betting";

interface Props {
  selections: BetSelection[];
  stake: number;
  onStakeChange: (stake: number) => void;
  onRemove: (matchId: number, market: string) => void;
  onPlace: () => void;
  placing: boolean;
  balance: number;
}

export const BetSlip = ({ selections, stake, onStakeChange, onRemove, onPlace, placing, balance }: Props) => {
  const totalOdds = selections.reduce((p, s) => p * Number(s.odds), 1);
  const potentialPayout = stake * totalOdds;
  const isMulti = selections.length > 1;
  const insufficient = stake > balance;
  const belowMin = stake < 100;

  return (
    <aside className="glass-strong sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Bet Slip</h3>
        <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
          {selections.length}
        </span>
        {isMulti && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
            Multibet
          </span>
        )}
      </div>

      {selections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 text-4xl opacity-40">⚽</div>
          <p className="text-sm text-muted-foreground">Tap an odds button to add a selection</p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {selections.map((s) => (
              <div key={`${s.matchId}-${s.market}`} className="glass rounded-2xl p-3 animate-float-up">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{s.homeTeam} vs {s.awayTeam}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{pickLabel(s.market, s.pick)}</span>
                      <span className="text-[11px] font-bold text-accent">@ {Number(s.odds).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(s.matchId, s.market)} className="rounded-full p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-glass-border pt-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stake (KSH)</label>
              <Input
                type="number" min={100}
                value={stake}
                onChange={(e) => onStakeChange(Number(e.target.value))}
                className="glass h-10 text-sm"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total odds</span>
              <span className="font-semibold">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Potential payout</span>
              <span className="font-bold text-accent">KSH {potentialPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            {insufficient && <p className="text-xs text-destructive">Insufficient balance</p>}
            <Button onClick={onPlace} variant="hero" size="lg" className="w-full" disabled={placing || belowMin || insufficient}>
              {placing ? "Placing..." : `Place ${isMulti ? "Multibet" : "Bet"}`}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">Min stake KSH 100</p>
          </div>
        </>
      )}
    </aside>
  );
};
