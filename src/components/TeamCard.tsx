import { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

const getTeamImage = (teamId: string): string => {
  const imageMap: Record<string, string> = {
    "ars": "/arsenal.jpeg",
    "mci": "/mancity.jpeg", 
    "liv": "/liverpool.jpeg",
    "che": "/chelsea.jpeg",
    "mun": "/manu.jpeg",
    "tot": "/tottenham.jpeg",
    "new": "/newcastle_.jpeg",
    "ast": "/aston.jpeg"
  };
  return imageMap[teamId] || "";
};

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
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden bg-white/10">
        <img
          src={getTeamImage(team.id)}
          alt={team.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to colored circle if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLDivElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="hidden h-full w-full items-center justify-center text-lg font-bold tracking-tight"
          style={{ background: `hsl(${team.color})`, color: team.short === "TOT" || team.short === "NEW" ? "hsl(226 60% 8%)" : "white" }}
        >
          {team.short}
        </div>
      </div>
      <div className="text-sm font-semibold">{team.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Odds</span>
        <span className="text-lg font-bold text-accent">{team.odds.toFixed(2)}</span>
      </div>
    </button>
  );
};
