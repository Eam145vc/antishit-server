import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import AlertBanner from '../components/common/AlertBanner';
import { useSocket } from '../hooks/useSocket';
import { useAlert } from '../hooks/useAlert';
import api from '../api/apiClient';

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }) => {
  const changeColor = {
    positive: 'text-success-500',
    negative: 'text-danger-500',
    neutral: 'text-gray-500'
  };
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={changeColor[changeType]}>
              {changeType === 'positive' && '↑'}
              {changeType === 'negative' && '↓'}
              {change}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const TrustLevelDistribution = ({ devices = [] }) => {
  // Count devices by trust level
  const trustLevels = {
    high: devices.filter(d => d.trustLevel === 'high').length,
    medium: devices.filter(d => d.trustLevel === 'medium').length,
    low: devices.filter(d => d.trustLevel === 'low').length
  };
  
  const total = devices.length || 1; // Avoid division by zero
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Trust Level Distribution</h3>
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-success-700">High Trust</span>
            <span className="text-sm font-medium text-success-700">{trustLevels.high}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-success-500 h-2.5 rounded-full" 
              style={{ width: `${(trustLevels.high / total) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-warning-700">Medium Trust</span>
            <span className="text-sm font-medium text-warning-700">{trustLevels.medium}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-warning-500 h-2.5 rounded-full" 
              style={{ width: `${(trustLevels.medium / total) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-danger-700">Low Trust</span>
            <span className="text-sm font-medium text-danger-700">{trustLevels.low}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-danger-500 h-2.5 rounded-full" 
              style={{ width: `${(trustLevels.low / total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentAlerts = ({ alerts = [] }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Alerts</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          {alerts.length} new
        </span>
      </div>
      <div className="border-t border-gray-200 divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {alerts.length > 0 ? (
          alerts.slice(0, 5).map((alert, index) => (
            <div key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary-600 truncate">{alert.title}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${alert.severity === 'high' ? 'bg-danger-100 text-danger-800' : 
                      alert.severity === 'medium' ? 'bg-warning-100 text-warning-800' : 
                      'bg-primary-100 text-primary-800'}`}
                  >
                    {alert.severity}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {alert.deviceName || 'Unknown Device'}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p>
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
            <p className="mt-1 text-sm text-gray-500">No recent alerts have been detected.</p>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/alerts" className="font-medium text-primary-600 hover:text-primary-500">
            View all alerts
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const ActiveDevices = ({ devices = [] }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Active Devices</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Currently connected devices being monitored.
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="max-h-80 overflow-y-auto">
          {devices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {devices.map((device, index) => (
                <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">{device.name}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${device.trustLevel === 'high' ? 'bg-success-100 text-success-800' : 
                          device.trustLevel === 'medium' ? 'bg-warning-100 text-warning-800' : 
                          'bg-danger-100 text-danger-800'}`}
                      >
                        {device.trustLevel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        {device.status}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <p>
                        Last seen {new Date(device.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-12 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
              <p className="mt-1 text-sm text-gray-500">No devices are currently connected.</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/monitoring" className="font-medium text-primary-600 hover:text-primary-500">
            View all devices
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { realtimeData } = useSocket();
  const { alerts } = useAlert();
  const [systemStatus, setSystemStatus] = useState({
    activeMonitoring: 0,
    totalDevices: 0,
    suspiciousProcesses: 0,
    recentIncidents: 0
  });
  
  // Fetch system status on mount
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        // This would be an actual API call in a real application
        // const response = await api.getSystemStatus();
        // setSystemStatus(response.data);
        
        // Mocked data for demo purposes
        setSystemStatus({
          activeMonitoring: realtimeData.devices.length,
          totalDevices: 24,
          suspiciousProcesses: 3,
          recentIncidents: alerts.length
        });
      } catch (error) {
        console.error('Error fetching system status:', error);
      }
    };
    
    fetchSystemStatus();
  }, [realtimeData.devices.length, alerts.length]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of the anti-cheat monitoring system
              </p>
            </div>
            
            {/* Alert Banner */}
            {alerts.length > 0 && (
              <AlertBanner 
                title="New Alerts Detected"
                message={`You have ${alerts.length} unread alerts that require your attention.`}
                severity="warning"
                autoClose={false}
              />
            )}
            
            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Active Monitoring" 
                value={systemStatus.activeMonitoring}
                icon={
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                change="Active and secure"
                changeType="positive"
              />
              <StatCard 
                title="Total Devices" 
                value={systemStatus.totalDevices}
                icon={
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                change="2 new devices today"
                changeType="neutral"
              />
              <StatCard 
                title="Suspicious Processes" 
                value={systemStatus.suspiciousProcesses}
                icon={
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
                change="Needs investigation"
                changeType="negative"
              />
              <StatCard 
                title="Recent Incidents" 
                value={systemStatus.recentIncidents}
                icon={
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="Last 24 hours"
                changeType="neutral"
              />
            </div>
            
            {/* Main Content */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TrustLevelDistribution devices={realtimeData.devices} />
              <RecentAlerts alerts={alerts} />
            </div>
            
            <div className="mt-6">
              <ActiveDevices devices={realtimeData.devices} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;