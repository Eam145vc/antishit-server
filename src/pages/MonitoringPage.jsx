import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import AlertBanner from '../components/common/AlertBanner';
import { useSocket } from '../hooks/useSocket';
import api from '../api/apiClient';

// Device card component
const DeviceCard = ({ device, isSelected, onClick, onRequestScreenshot }) => {
  const getTrustLevelClasses = (level) => {
    switch (level) {
      case 'high':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusClasses = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success-100 text-success-800';
      case 'idle':
        return 'bg-warning-100 text-warning-800';
      case 'offline':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 truncate">{device.name}</h3>
          <p className="text-sm text-gray-500">{device.id}</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrustLevelClasses(device.trustLevel)}`}>
            {device.trustLevel}
          </span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">OS:</span>
          <span className="ml-1 font-medium">{device.os || 'Unknown'}</span>
        </div>
        <div>
          <span className="text-gray-500">IP:</span>
          <span className="ml-1 font-medium">{device.ip || 'Unknown'}</span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClasses(device.status)}`}>
            {device.status || 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Last Seen:</span>
          <span className="ml-1 font-medium">
            {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onRequestScreenshot(device.id);
          }}
        >
          Request Screenshot
        </button>
      </div>
    </div>
  );
};

// Processes list component
const ProcessesList = ({ processes, deviceId }) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Sort and filter processes
  const filteredProcesses = processes
    ? processes
      .filter(process => 
        process.name.toLowerCase().includes(filter.toLowerCase()) ||
        process.path?.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      })
    : [];
  
  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  if (!processes) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Select a device to view processes</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Running Processes</h3>
          <div className="relative">
            <input
              type="text"
              className="input py-1 px-3 text-sm"
              placeholder="Filter processes..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortBy === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('pid')}
              >
                PID
                {sortBy === 'pid' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Memory
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProcesses.length > 0 ? (
              filteredProcesses.map((process, index) => (
                <tr key={index} className={process.suspicious ? 'bg-danger-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{process.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {process.name}
                          {process.suspicious && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger-100 text-danger-800">
                              Suspicious
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{process.path}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.pid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                      {process.status || 'Running'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.memory ? `${process.memory} MB` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">Details</button>
                    <button className="text-danger-600 hover:text-danger-900">Terminate</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No processes match your filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Screenshot viewer component
const ScreenshotViewer = ({ screenshots, deviceId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Reset index when device changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [deviceId]);
  
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-50 border rounded-lg p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-center">No screenshots available for this device</p>
      </div>
    );
  }
  
  const currentScreenshot = screenshots[currentIndex];
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-8' : 'relative'}`}>
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 text-white z-10 bg-black bg-opacity-50 rounded-full p-2"
          onClick={() => setIsFullscreen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className={`${isFullscreen ? 'max-w-full max-h-full' : 'rounded-lg border overflow-hidden'}`}>
        <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Screenshot {currentIndex + 1} of {screenshots.length}</h3>
            <p className="text-xs text-gray-500">
              {currentScreenshot.timestamp ? new Date(currentScreenshot.timestamp).toLocaleString() : 'Unknown time'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="p-1 rounded hover:bg-gray-200"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-5v5m0 0l3-3m-3 3l-3-3" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className={`relative ${isFullscreen ? 'flex justify-center' : ''}`}>
          <img
            src={currentScreenshot.imageUrl}
            alt={`Screenshot ${currentIndex + 1}`}
            className={`max-w-full ${isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[400px]'}`}
          />
          
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
            <button
              className="bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
              onClick={() => setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 border-t overflow-x-auto">
          <div className="flex space-x-2">
            {screenshots.map((screenshot, index) => (
              <button
                key={index}
                className={`w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 ${
                  index === currentIndex ? 'border-primary-500' : 'border-transparent'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={screenshot.thumbnailUrl || screenshot.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main monitoring page component
const MonitoringPage = () => {
  const { connected, realtimeData, requestDeviceUpdates, requestScreenshot } = useSocket();
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Effect to fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        // In a real application, this would fetch initial data from the API
        // The socket will then provide real-time updates
        
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to fetch devices');
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, []);
  
  // Select first device if none selected and devices are available
  useEffect(() => {
    if (!selectedDeviceId && realtimeData.devices.length > 0) {
      setSelectedDeviceId(realtimeData.devices[0].id);
    }
  }, [selectedDeviceId, realtimeData.devices]);
  
  // Request updates for selected device
  useEffect(() => {
    if (selectedDeviceId) {
      requestDeviceUpdates(selectedDeviceId);
    }
  }, [selectedDeviceId, requestDeviceUpdates]);
  
  // Handler for requesting screenshots
  const handleRequestScreenshot = useCallback(async (deviceId) => {
    try {
      await requestScreenshot(deviceId);
      setAlert({
        type: 'success',
        message: 'Screenshot requested successfully'
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to request screenshot'
      });
      
      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  }, [requestScreenshot]);
  
  // Get selected device
  const selectedDevice = realtimeData.devices.find(d => d.id === selectedDeviceId);
  
  // Get processes for selected device
  const selectedDeviceProcesses = selectedDeviceId ? realtimeData.processes[selectedDeviceId] : null;
  
  // Get screenshots for selected device
  const selectedDeviceScreenshots = selectedDeviceId ? realtimeData.screenshots[selectedDeviceId] : null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Real-time Monitoring</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor devices, processes, and activities in real-time
              </p>
            </div>
            
            {/* Connection status alert */}
            {!connected && (
              <AlertBanner
                title="Connection Error"
                message="You are currently disconnected from the real-time monitoring service. We're trying to reconnect..."
                severity="error"
              />
            )}
            
            {/* Success/Error alert */}
            {alert && (
              <AlertBanner
                message={alert.message}
                severity={alert.type}
                autoClose={true}
              />
            )}
            
            {/* Loading state */}
            {loading ? (
              <Loading message="Loading monitoring data..." />
            ) : error ? (
              <AlertBanner
                title="Error"
                message={error}
                severity="error"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Devices section */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Devices</h2>
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {realtimeData.devices.length} Active
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {realtimeData.devices.length > 0 ? (
                        realtimeData.devices.map((device) => (
                          <DeviceCard
                            key={device.id}
                            device={device}
                            isSelected={selectedDeviceId === device.id}
                            onClick={() => setSelectedDeviceId(device.id)}
                            onRequestScreenshot={handleRequestScreenshot}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500">No devices connected</p>
                          <p className="text-sm text-gray-400 mt-1">Waiting for device connections...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Main monitoring section */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Device details */}
                  {selectedDevice && (
                    <div className="bg-white shadow rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            {selectedDevice.name}
                          </h2>
                          <p className="text-sm text-gray-500">{selectedDevice.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedDevice.trustLevel === 'high' ? 'trust-level-high' :
                          selectedDevice.trustLevel === 'medium' ? 'trust-level-medium' :
                          'trust-level-low'
                        }`}>
                          {selectedDevice.trustLevel} Trust
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500">IP Address</p>
                          <p className="text-sm font-semibold">{selectedDevice.ip || 'Unknown'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500">Operating System</p>
                          <p className="text-sm font-semibold">{selectedDevice.os || 'Unknown'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500">Last Activity</p>
                          <p className="text-sm font-semibold">
                            {selectedDevice.lastSeen ? new Date(selectedDevice.lastSeen).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Screenshots */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Real-time Screenshots
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Review screenshots captured from the selected device
                      </p>
                    </div>
                    <div className="p-4">
                      <ScreenshotViewer 
                        screenshots={selectedDeviceScreenshots || []} 
                        deviceId={selectedDeviceId} 
                      />
                    </div>
                  </div>
                  
                  {/* Processes */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <ProcessesList processes={selectedDeviceProcesses} deviceId={selectedDeviceId} />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;