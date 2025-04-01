import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import AlertBanner from '../components/common/AlertBanner';
import api from '../api/apiClient';

// Timeline component
const PlayerTimeline = ({ playerId, timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No timeline data available for this player</p>
      </div>
    );
  }
  
  // Group by date
  const groupedByDate = timeline.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'login':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'logout':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'suspicious':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-danger-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-danger-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'process':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-warning-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'screenshot':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedByDate).map(([date, events]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-500">{date}</h3>
          <div className="mt-3 space-y-3">
            {events.map((event, index) => (
              <div key={index} className="relative timeline-item">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      {event.details && (
                        <p className="mt-1">{event.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Player Comparison component
const PlayerComparison = ({ players, onSelectPlayer }) => {
  if (!players || players.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No player data available for comparison</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Player
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sessions
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Suspicious Activities
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trust Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Active
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">{player.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {player.sessions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  player.suspiciousActivities > 5 ? 'bg-danger-100 text-danger-800' :
                  player.suspiciousActivities > 0 ? 'bg-warning-100 text-warning-800' :
                  'bg-success-100 text-success-800'
                }`}>
                  {player.suspiciousActivities}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                    <div
                      className={`h-2.5 rounded-full ${
                        player.trustScore >= 70 ? 'bg-success-500' :
                        player.trustScore >= 40 ? 'bg-warning-500' :
                        'bg-danger-500'
                      }`}
                      style={{ width: `${player.trustScore}%` }}
                    ></div>
                  </div>
                  <span>{player.trustScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(player.lastActive).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onSelectPlayer(player.id)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Behavior Analysis component
const BehaviorAnalysis = ({ playerId, behaviorData }) => {
  if (!behaviorData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No behavior data available for this player</p>
      </div>
    );
  }
  
  const { metrics, anomalies } = behaviorData;
  
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden border">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metric.name}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {metric.value}
                    {metric.unit && <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>}
                  </dd>
                  <dd className={`mt-2 text-sm ${
                    metric.trend === 'up' ? 'text-success-600' :
                    metric.trend === 'down' ? 'text-danger-600' :
                    'text-gray-500'
                  }`}>
                    {metric.trend === 'up' && '↑ '}
                    {metric.trend === 'down' && '↓ '}
                    {metric.comparison}
                  </dd>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Anomalies */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Detected Anomalies</h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {anomalies.length > 0 ? (
              anomalies.map((anomaly, index) => (
                <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        anomaly.severity === 'high' ? 'bg-danger-100' :
                        anomaly.severity === 'medium' ? 'bg-warning-100' :
                        'bg-primary-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                          anomaly.severity === 'high' ? 'text-danger-600' :
                          anomaly.severity === 'medium' ? 'text-warning-600' :
                          'text-primary-600'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{anomaly.type}</p>
                        <p className="text-sm text-gray-500">{anomaly.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        anomaly.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                        anomaly.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                        'bg-primary-100 text-primary-800'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Investigate
                        <span aria-hidden="true"> &rarr;</span>
                      </a>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No anomalies detected</h3>
                <p className="mt-1 text-sm text-gray-500">This player's behavior appears to be within normal parameters.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Forensics page component
const ForensicsPage = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [playerTimeline, setPlayerTimeline] = useState(null);
  const [playerBehavior, setPlayerBehavior] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [error, setError] = useState(null);
  
  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would fetch actual data from the API
        // For demo purposes, we're generating mock data
        
        // Mock players data
        const mockPlayers = [
          {
            id: 'player1',
            name: 'JohnDoe123',
            sessions: 42,
            suspiciousActivities: 0,
            trustScore: 92,
            lastActive: '2023-07-15T14:30:00Z'
          },
          {
            id: 'player2',
            name: 'ProGamer456',
            sessions: 87,
            suspiciousActivities: 3,
            trustScore: 65,
            lastActive: '2023-07-14T18:45:00Z'
          },
          {
            id: 'player3',
            name: 'SuspectPlayer',
            sessions: 12,
            suspiciousActivities: 8,
            trustScore: 30,
            lastActive: '2023-07-16T09:20:00Z'
          },
          {
            id: 'player4',
            name: 'CasualGamer',
            sessions: 29,
            suspiciousActivities: 1,
            trustScore: 78,
            lastActive: '2023-07-16T11:10:00Z'
          }
        ];
        
        setPlayers(mockPlayers);
        
        // Select first player by default
        if (mockPlayers.length > 0 && !selectedPlayerId) {
          setSelectedPlayerId(mockPlayers[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to fetch player data');
        setLoading(false);
      }
    };
    
    fetchPlayers();
  }, [selectedPlayerId]);
  
  // Fetch player details when selection changes
  useEffect(() => {
    if (!selectedPlayerId) return;
    
    const fetchPlayerDetails = async () => {
      try {
        setLoading(true);
        
        // In a real application, these would be actual API calls
        // const timelineData = await api.getPlayerTimeline(selectedPlayerId);
        // const behaviorData = await api.getPlayerBehaviorStats(selectedPlayerId);
        
        // Mock timeline data
        const mockTimeline = [
          {
            type: 'login',
            title: 'Player logged in',
            timestamp: '2023-07-16T08:30:00Z',
            details: 'IP: 192.168.1.1, Device: Windows PC'
          },
          {
            type: 'process',
            title: 'Suspicious process detected',
            timestamp: '2023-07-16T08:35:00Z',
            details: 'Process: memory_scanner.exe was detected and flagged'
          },
          {
            type: 'screenshot',
            title: 'Screenshot captured',
            timestamp: '2023-07-16T08:40:00Z'
          },
          {
            type: 'suspicious',
            title: 'Unusual behavior detected',
            timestamp: '2023-07-16T09:15:00Z',
            details: 'Player achieved unusually high accuracy statistics'
          },
          {
            type: 'logout',
            title: 'Player logged out',
            timestamp: '2023-07-16T10:20:00Z'
          },
          {
            type: 'login',
            title: 'Player logged in',
            timestamp: '2023-07-15T14:10:00Z',
            details: 'IP: 192.168.1.1, Device: Windows PC'
          },
          {
            type: 'screenshot',
            title: 'Screenshot captured',
            timestamp: '2023-07-15T14:30:00Z'
          },
          {
            type: 'logout',
            title: 'Player logged out',
            timestamp: '2023-07-15T15:45:00Z'
          }
        ];
        
        // Mock behavior data
        const mockBehavior = {
          metrics: [
            {
              name: 'Accuracy',
              value: '87.5',
              unit: '%',
              trend: 'up',
              comparison: '12% above average'
            },
            {
              name: 'Reaction Time',
              value: '182',
              unit: 'ms',
              trend: 'down',
              comparison: '15% faster than average'
            },
            {
              name: 'Headshot Ratio',
              value: '0.42',
              trend: 'neutral',
              comparison: 'Within normal range'
            },
            {
              name: 'Hours Played',
              value: '237',
              unit: 'h',
              trend: 'neutral',
              comparison: 'Regular player'
            },
            {
              name: 'Win Rate',
              value: '62.3',
              unit: '%',
              trend: 'up',
              comparison: '8% above average'
            },
            {
              name: 'K/D Ratio',
              value: '2.8',
              trend: 'up',
              comparison: '40% above average'
            }
          ],
          anomalies: selectedPlayerId === 'player3' ? [
            {
              type: 'Accuracy Spike',
              description: 'Sudden increase in accuracy from 65% to 95% within one session',
              severity: 'high',
              timestamp: '2023-07-16T09:15:00Z'
            },
            {
              type: 'Reaction Time Anomaly',
              description: 'Unnaturally consistent reaction times across multiple encounters',
              severity: 'medium',
              timestamp: '2023-07-16T09:30:00Z'
            },
            {
              type: 'Input Pattern',
              description: 'Suspicious input patterns consistent with auto-aim tools',
              severity: 'high',
              timestamp: '2023-07-16T09:45:00Z'
            }
          ] : []
        };
        
        setPlayerTimeline(mockTimeline);
        setPlayerBehavior(mockBehavior);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching player details:', err);
        setError('Failed to fetch player details');
        setLoading(false);
      }
    };
    
    fetchPlayerDetails();
  }, [selectedPlayerId]);
  
  // Handle player selection
  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
  };
  
  // Get selected player
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Forensic Analysis</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analyze player behavior and investigate suspicious activities
              </p>
            </div>
            
            {/* Error alert */}
            {error && (
              <AlertBanner
                title="Error"
                message={error}
                severity="error"
              />
            )}
            
            {/* Loading state */}
            {loading ? (
              <Loading message="Loading forensic data..." />
            ) : (
              <div className="space-y-6">
                {/* Player comparison */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Player Comparison</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Compare players and identify suspicious behavior patterns
                    </p>
                  </div>
                  <div className="p-4">
                    <PlayerComparison
                      players={players}
                      onSelectPlayer={handleSelectPlayer}
                    />
                  </div>
                </div>
                
                {/* Selected player details */}
                {selectedPlayer && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {selectedPlayer.name}
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Player ID: {selectedPlayer.id}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                            selectedPlayer.trustScore >= 70 ? 'bg-success-100 text-success-800' :
                            selectedPlayer.trustScore >= 40 ? 'bg-warning-100 text-warning-800' :
                            'bg-danger-100 text-danger-800'
                          }`}>
                            Trust Score: {selectedPlayer.trustScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex -mb-px" aria-label="Tabs">
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className={`${
                            activeTab === 'timeline'
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                        >
                          Timeline
                        </button>
                        <button
                          onClick={() => setActiveTab('behavior')}
                          className={`${
                            activeTab === 'behavior'
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                        >
                          Behavior Analysis
                        </button>
                      </nav>
                    </div>
                    
                    {/* Tab content */}
                    <div className="p-4">
                      {activeTab === 'timeline' && (
                        <PlayerTimeline
                          playerId={selectedPlayerId}
                          timeline={playerTimeline}
                        />
                      )}
                      
                      {activeTab === 'behavior' && (
                        <BehaviorAnalysis
                          playerId={selectedPlayerId}
                          behaviorData={playerBehavior}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ForensicsPage;