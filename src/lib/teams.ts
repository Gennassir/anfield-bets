export type Team = {
  id: string;
  name: string;
  short: string;
  color: string; // hsl values
  odds: number;
};

export const teams: Team[] = [
  { id: "ars", name: "Arsenal", short: "ARS", color: "0 85% 55%", odds: 13 },
  { id: "mci", name: "Manchester City", short: "MCI", color: "200 85% 55%", odds: 10 },
  { id: "liv", name: "Liverpool", short: "LIV", color: "0 90% 45%", odds: 17 },
  { id: "che", name: "Chelsea", short: "CHE", color: "220 85% 50%", odds: 5.5 },
  { id: "mun", name: "Manchester United", short: "MUN", color: "5 85% 50%", odds: 15 },
  { id: "tot", name: "Tottenham", short: "TOT", color: "210 30% 90%", odds: 22 },
  { id: "new", name: "Newcastle", short: "NEW", color: "0 0% 95%", odds: 20 },
  { id: "ast", name: "Aston Villa", short: "AVL", color: "320 60% 35%", odds: 18 },
];
