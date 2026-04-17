// import { supabase } from '@/integrations/supabase/client'; // Temporarily commented out

const API_BASE_URL = 'https://api.football-data.org/v4';
const API_TOKEN = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  lastUpdated: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group?: string;
  lastUpdated: string;
  venue?: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner: string;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  odds?: {
    msg: string;
  };
  referees: Array<{
    id: number;
    name: string;
    type: string;
    nationality: string;
  }>;
}

export interface Standing {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

class FootballApiService {
  private headers = {
    'X-Auth-Token': API_TOKEN,
  };

  async fetchFromApi(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  }

  // Get Premier League matches
  async getPremierLeagueMatches(): Promise<Match[]> {
    try {
      const data = await this.fetchFromApi('/competitions/PL/matches');
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching Premier League matches:', error);
      throw error;
    }
  }

  // Get Premier League standings
  async getPremierLeagueStandings(): Promise<Standing[]> {
    try {
      const data = await this.fetchFromApi('/competitions/PL/standings');
      return data.standings[0]?.table || [];
    } catch (error) {
      console.error('Error fetching Premier League standings:', error);
      throw error;
    }
  }

  // Get Premier League teams
  async getPremierLeagueTeams(): Promise<Team[]> {
    try {
      const data = await this.fetchFromApi('/competitions/PL/teams');
      return data.teams || [];
    } catch (error) {
      console.error('Error fetching Premier League teams:', error);
      throw error;
    }
  }

  // Get matches for today
  async getTodayMatches(): Promise<Match[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await this.fetchFromApi(`/competitions/PL/matches?dateFrom=${today}&dateTo=${today}`);
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching today matches:', error);
      throw error;
    }
  }

  // Get live matches
  async getLiveMatches(): Promise<Match[]> {
    try {
      const data = await this.fetchFromApi('/competitions/PL/matches?status=LIVE');
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  // Get match by ID
  async getMatch(matchId: number): Promise<Match> {
    try {
      const data = await this.fetchFromApi(`/matches/${matchId}`);
      return data;
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  }

  // Get team by ID
  async getTeam(teamId: number): Promise<Team> {
    try {
      const data = await this.fetchFromApi(`/teams/${teamId}`);
      return data;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  // TODO: Add database operations once Supabase types are updated
  // For now, we'll focus on API calls only
}

export const footballApi = new FootballApiService();
