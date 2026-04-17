import React, { useState, useEffect } from 'react';
import { footballApi, Team } from '../services/footballApi';

const TeamsList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const teamsData = await footballApi.getPremierLeagueTeams();
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.tla.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="font-bold">Error loading teams</p>
        <p>{error}</p>
        <button
          onClick={fetchTeams}
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
        <h1 className="text-3xl font-bold text-gray-800">Premier League Teams</h1>
        <button
          onClick={fetchTeams}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center mb-4">
              <img
                src={team.crest}
                alt={team.name}
                className="h-16 w-16 mr-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=LOGO';
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.shortName}</p>
                <p className="text-xs text-gray-400">{team.tla}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Founded:</span>
                <span className="text-gray-900">{team.founded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stadium:</span>
                <span className="text-gray-900">{team.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Colors:</span>
                <span className="text-gray-900">{team.clubColors}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                Visit Website →
              </a>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <p>{team.address}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No teams found matching "{searchTerm}"</p>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">League Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
            <p className="text-sm text-gray-600">Total Teams</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {teams.filter(t => t.founded && t.founded < 1900).length}
            </p>
            <p className="text-sm text-gray-600">Founded before 1900</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(teams.reduce((acc, t) => acc + (t.founded || 0), 0) / teams.length)}
            </p>
            <p className="text-sm text-gray-600">Average founding year</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsList;
