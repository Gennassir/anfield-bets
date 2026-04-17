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
  
  // Calculate dynamic odds based on predicted points
  const calculateDynamicOdds = (baseOdds: number, predictedPoints: number) => {
    // Base odds adjustment formula
    // Higher predicted points = lower odds (harder to achieve)
    // Lower predicted points = higher odds (easier to achieve)
    
    const basePoints = 75; // Reference point
    const maxAdjustment = 0.5; // Maximum 50% adjustment
    const adjustmentFactor = (predictedPoints - basePoints) / basePoints;
    const oddsAdjustment = adjustmentFactor * maxAdjustment;
    
    const dynamicOdds = baseOdds * (1 - oddsAdjustment);
    
    // Ensure odds don't go below 1.1 or above 10.0
    return Math.max(1.1, Math.min(10.0, dynamicOdds));
  };
  
  const totalPayout = items.reduce((s, i) => {
    const dynamicOdds = calculateDynamicOdds(i.team.odds, i.predictedPoints);
    return s + (i.stake || 0) * dynamicOdds;
  }, 0);

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
            {items.map((item) => {
              const dynamicOdds = calculateDynamicOdds(item.team.odds, item.predictedPoints);
              const individualPayout = (item.stake || 0) * dynamicOdds;
              const oddsChange = ((dynamicOdds - item.team.odds) / item.team.odds) * 100;
              
              return (
                <div key={item.team.id} className="glass rounded-2xl p-3 animate-float-up">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{item.team.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Base odds: {item.team.odds.toFixed(2)}</span>
                        <span className="text-[11px] text-accent">Dynamic: {dynamicOdds.toFixed(2)}</span>
                        {oddsChange !== 0 && (
                          <span className={`text-[10px] font-semibold ${
                            oddsChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({oddsChange > 0 ? '+' : ''}{oddsChange.toFixed(1)}%)
                          </span>
                        )}
                      </div>
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
                <div className="mt-2 pt-2 border-t border-glass-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Potential payout</span>
                    <span className="font-bold text-accent">KSH {individualPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
              );
            })}
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
            <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xs font-semibold text-primary mb-1">Dynamic Odds Explained</div>
              <div className="text-[10px] text-muted-foreground space-y-1">
                <div> Higher predicted points = Lower odds (harder to achieve)</div>
                <div> Lower predicted points = Higher odds (easier to achieve)</div>
                <div> Odds adjust automatically as you change points</div>
              </div>
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
