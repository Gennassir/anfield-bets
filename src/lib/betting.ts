export type Market = "1X2" | "OU25" | "BTTS";
export type Pick = "HOME" | "DRAW" | "AWAY" | "OVER" | "UNDER" | "YES" | "NO";

export interface BetSelection {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  market: Market;
  pick: Pick;
  odds: number;
  label: string;
}

export const pickLabel = (market: Market, pick: Pick) => {
  if (market === "1X2") return pick === "HOME" ? "Home win" : pick === "DRAW" ? "Draw" : "Away win";
  if (market === "OU25") return pick === "OVER" ? "Over 2.5" : "Under 2.5";
  return pick === "YES" ? "BTTS Yes" : "BTTS No";
};
