import { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

interface Props {
  team: Team;
  selected: boolean;
  onClick: () => void;
}

export const TeamCard = ({ team, selected, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300",
        "hover:scale-[1.03] hover:border-primary/50",
        selected && "ring-2 ring-primary shadow-[var(--shadow-glow)]"
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${team.color} / 0.2), hsl(255 100% 100% / 0.06))`,
      }}
    >
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold tracking-tight"
        style={{ background: `hsl(${team.color})`, color: team.short === "TOT" || team.short === "NEW" ? "hsl(226 60% 8%)" : "white" }}
      >
        {team.short}
      </div>
      <div className="text-sm font-semibold">{team.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Odds</span>
        <span className="text-lg font-bold text-accent">{team.odds.toFixed(2)}</span>
      </div>
    </button>
  );
};
