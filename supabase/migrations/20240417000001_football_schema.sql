-- Football Database Schema
-- Created for Anfield Bets project

-- Leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    season VARCHAR(20) NOT NULL,
    logo_url TEXT,
    flag_url TEXT,
    api_league_id INTEGER UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    country VARCHAR(100),
    founded_year INTEGER,
    logo_url TEXT,
    stadium VARCHAR(255),
    stadium_capacity INTEGER,
    website TEXT,
    api_team_id INTEGER UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    position VARCHAR(50),
    date_of_birth DATE,
    nationality VARCHAR(100),
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    photo_url TEXT,
    api_player_id INTEGER UNIQUE,
    current_team_id INTEGER REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
    home_score INTEGER,
    away_score INTEGER,
    home_half_time_score INTEGER,
    away_half_time_score INTEGER,
    round VARCHAR(100),
    venue VARCHAR(255),
    referee VARCHAR(255),
    api_match_id INTEGER UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    season VARCHAR(20) NOT NULL,
    position INTEGER NOT NULL,
    played_matches INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    form VARCHAR(20), -- Last 5 matches: WWLDW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, league_id, season)
);

-- Match events table (goals, cards, substitutions)
CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    player_id INTEGER REFERENCES players(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    event_type VARCHAR(50) NOT NULL, -- GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION
    event_minute INTEGER NOT NULL,
    event_extra_minute INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team statistics table
CREATE TABLE IF NOT EXISTS team_statistics (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    season VARCHAR(20) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    failed_to_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, league_id, season)
);

-- Player statistics table
CREATE TABLE IF NOT EXISTS player_statistics (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    season VARCHAR(20) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, team_id, league_id, season)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leagues_name ON leagues(name);
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues(country);
CREATE INDEX IF NOT EXISTS idx_leagues_season ON leagues(season);

CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country);

CREATE INDEX IF NOT EXISTS idx_players_name ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(current_team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE INDEX IF NOT EXISTS idx_standings_team_league ON standings(team_id, league_id);
CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(position);

CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);

CREATE INDEX IF NOT EXISTS idx_team_stats_team_league ON team_statistics(team_id, league_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_league ON player_statistics(player_id, league_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_standings_updated_at BEFORE UPDATE ON standings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_statistics_updated_at BEFORE UPDATE ON team_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO leagues (name, country, season, api_league_id) VALUES
('Premier League', 'England', '2024-2025', 39),
('La Liga', 'Spain', '2024-2025', 140),
('Serie A', 'Italy', '2024-2025', 135),
('Bundesliga', 'Germany', '2024-2025', 78),
('Ligue 1', 'France', '2024-2025', 61)
ON CONFLICT (api_league_id) DO NOTHING;

INSERT INTO teams (name, short_name, country, founded_year, api_team_id) VALUES
('Liverpool', 'LIV', 'England', 1892, 40),
('Manchester United', 'MUN', 'England', 1878, 33),
('Manchester City', 'MCI', 'England', 1880, 50),
('Chelsea', 'CHE', 'England', 1905, 49),
('Arsenal', 'ARS', 'England', 1886, 42),
('Tottenham', 'TOT', 'England', 1882, 47),
('Real Madrid', 'RMA', 'Spain', 1902, 541),
('Barcelona', 'BAR', 'Spain', 1899, 529),
('Juventus', 'JUV', 'Italy', 1897, 496),
('AC Milan', 'ACM', 'Italy', 1899, 489),
('Bayern Munich', 'FCB', 'Germany', 1900, 157),
('PSG', 'PSG', 'France', 1970, 85)
ON CONFLICT (api_team_id) DO NOTHING;
