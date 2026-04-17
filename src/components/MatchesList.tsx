import React, { useState, useEffect } from 'react';
import { footballApi, Match } from '../services/footballApi';

const MatchesList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'today'>('all');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let matchesData: Match[] = [];
      
      switch (filter) {
        case 'live':
          matchesData = await footballApi.getLiveMatches();
          break;
        case 'today':
          matchesData = await footballApi.getTodayMatches();
          break;
        default:
          matchesData = await footballApi.getPremierLeagueMatches();
      }
      
      setMatches(matchesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500 text-white';
      case 'FINISHED':
        return 'bg-gray-500 text-white';
      case 'SCHEDULED':
        return 'bg-blue-500 text-white';
      case 'POSTPONED':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'LIVE';
      case 'FINISHED':
        return 'FT';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'POSTPONED':
        return 'Postponed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error loading matches</p>
        <p>{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {filter === 'live' ? 'Live Matches' : 
           filter === 'today' ? "Today's Matches" : 
           'Premier League Matches'}
        </h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFilter('all');
            }}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Matches
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFilter('live');
            }}
            className={`px-4 py-2 rounded ${
              filter === 'live'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFilter('today');
            }}
            className={`px-4 py-2 rounded ${
              filter === 'today'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No matches found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  Matchday {match.matchday}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(match.status)}`}>
                  {getStatusText(match.status)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-right flex-1">
                    <p className="font-semibold text-gray-800">{match.homeTeam.name}</p>
                    <p className="text-sm text-gray-500">{match.homeTeam.shortName}</p>
                  </div>
                  
                  <div className="text-center px-4">
                    {match.status === 'SCHEDULED' ? (
                      <div>
                        <p className="text-xs text-gray-500">vs</p>
                        <p className="text-sm text-gray-600">
                          {formatMatchDate(match.utcDate)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">
                        <span>{match.score.fullTime.home || 0}</span>
                        <span className="mx-2">-</span>
                        <span>{match.score.fullTime.away || 0}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">{match.awayTeam.name}</p>
                    <p className="text-sm text-gray-500">{match.awayTeam.shortName}</p>
                  </div>
                </div>
              </div>

              {match.status === 'LIVE' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>HT: {match.score.halfTime.home || 0} - {match.score.halfTime.away || 0}</span>
                    <span>{match.referees[0]?.name || 'No referee info'}</span>
                  </div>
                </div>
              )}

              {match.venue && (
                <div className="mt-2 text-sm text-gray-500">
                  Venue: {match.venue}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesList;
