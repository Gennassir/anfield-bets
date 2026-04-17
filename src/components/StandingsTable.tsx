import React, { useState, useEffect } from 'react';
import { footballApi, Standing } from '../services/footballApi';

const StandingsTable: React.FC = () => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const standingsData = await footballApi.getPremierLeagueStandings();
      setStandings(standingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch standings');
    } finally {
      setLoading(false);
    }
  };

  const getFormColor = (result: string) => {
    switch (result) {
      case 'W':
        return 'bg-green-500 text-white';
      case 'D':
        return 'bg-yellow-500 text-black';
      case 'L':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  const getQualificationBadge = (position: number) => {
    if (position <= 4) {
      return { color: 'bg-blue-100 text-blue-800', text: 'UCL' };
    } else if (position === 5) {
      return { color: 'bg-orange-100 text-orange-800', text: 'UEL' };
    } else if (position === 6) {
      return { color: 'bg-purple-100 text-purple-800', text: 'UECL' };
    } else if (position >= 18) {
      return { color: 'bg-red-100 text-red-800', text: 'REL' };
    }
    return null;
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
        <p className="font-bold">Error loading standings</p>
        <p>{error}</p>
        <button
          onClick={fetchStandings}
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
        <h1 className="text-3xl font-bold text-gray-800">Premier League Table</h1>
        <button
          onClick={fetchStandings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  W
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  D
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  L
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GF
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GA
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GD
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pts
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((standing) => {
                const qualification = getQualificationBadge(standing.position);
                const formArray = standing.form ? standing.form.split('') : [];
                
                return (
                  <tr
                    key={standing.team.id}
                    className={`hover:bg-gray-50 ${standing.position >= 18 ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {standing.position}
                        </span>
                        {qualification && (
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${qualification.color}`}
                          >
                            {qualification.text}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={standing.team.crest}
                          alt={standing.team.name}
                          className="h-8 w-8 mr-3"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/32x32?text=LOGO';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {standing.team.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {standing.team.shortName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {standing.playedGames}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                      {standing.won}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-yellow-600">
                      {standing.draw}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                      {standing.lost}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {standing.goalsFor}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {standing.goalsAgainst}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {standing.points}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {formArray.map((result, index) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Champions League</h3>
          <p className="text-sm text-blue-600">Positions 1-4 qualify for UEFA Champions League</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">Europa League</h3>
          <p className="text-sm text-orange-600">Position 5 qualifies for UEFA Europa League</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Relegation</h3>
          <p className="text-sm text-red-600">Positions 18-20 relegated to Championship</p>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
