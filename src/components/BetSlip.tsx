import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Receipt } from "lucide-react";
import { Team } from "@/lib/teams";

export interface BetItem {
  team: Team;
  predictedPoints: number;
  stake: number;
}

interface Props {
  items: BetItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BetItem>) => void;
  onPlace: () => void;
  placing: boolean;
}

export const BetSlip = ({ items, onRemove, onUpdate, onPlace, placing }: Props) => {
  const totalStake = items.reduce((s, i) => s + (i.stake || 0), 0);
  const totalPayout = items.reduce((s, i) => s + (i.stake || 0) * i.team.odds, 0);

  return (
    <aside className="glass-strong sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Bet Slip</h3>
        <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 text-4xl opacity-40">⚽</div>
          <p className="text-sm text-muted-foreground">Tap a team to start your slip</p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.team.id} className="glass rounded-2xl p-3 animate-float-up">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{item.team.name}</div>
                    <div className="text-[11px] text-muted-foreground">Odds {item.team.odds.toFixed(2)}</div>
                  </div>
                  <button onClick={() => onRemove(item.team.id)} className="rounded-full p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pred. pts</label>
                    <Input
                      type="number" min={0} max={114}
                      value={item.predictedPoints}
                      onChange={(e) => onUpdate(item.team.id, { predictedPoints: Number(e.target.value) })}
                      className="glass h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stake (KSH)</label>
                    <Input
                      type="number" min={100}
                      value={item.stake}
                      onChange={(e) => onUpdate(item.team.id, { stake: Number(e.target.value) })}
                      className="glass h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-glass-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total stake</span>
              <span className="font-semibold">KSH {totalStake.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Potential payout</span>
              <span className="font-bold text-accent">KSH {totalPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <Button onClick={onPlace} variant="hero" size="lg" className="w-full" disabled={placing || totalStake < 100}>
              {placing ? "Placing..." : "Place Bet"}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">Min stake KSH 100 per selection</p>
          </div>
        </>
      )}
    </aside>
  );
};
