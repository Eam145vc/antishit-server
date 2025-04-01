import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import AlertBanner from '../components/common/AlertBanner';
import { useSocket } from '../hooks/useSocket';
import api from '../api/apiClient';

// Command Center component
const CommandCenter = ({ selectedDevice, onCommand, commandResult }) => {
  const [command, setCommand] = useState('');
  const [commandType, setCommandType] = useState('screenshot');
  
  const commands = [
    { id: 'screenshot', name: 'Take Screenshot' },
    { id: 'processlist', name: 'List Processes' },
    { id: 'scan', name: 'Run Scan' },
    { id: 'terminate', name: 'Terminate Process' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    onCommand({
      deviceId: selectedDevice.id,
      type: commandType,
      params: command.trim() ? { details: command } : {}
    });
    
    // Clear input after submission
    setCommand('');
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Command Center</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Send commands to the selected device
        </p>
      </div>
      
      <div className="p-4">
        {selectedDevice ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="command-type" className="block text-sm font-medium text-gray-700">
                    Command Type
                  </label>
                  <select
                    id="command-type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={commandType}
                    onChange={(e) => setCommandType(e.target.value)}
                  >
                    {commands.map((cmd) => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="target-device" className="block text-sm font-medium text-gray-700">
                    Target Device
                  </label>
                  <div className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-gray-100 sm:text-sm rounded-md">
                    {selectedDevice.name} ({selectedDevice.id})
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="command-details" className="block text-sm font-medium text-gray-700">
                  Additional Details
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="command-details"
                    id="command-details"
                    className="input"
                    placeholder={commandType === 'terminate' ? 'Enter process ID or name' : 'Optional parameters'}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Send Command
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Please select a device to send commands</p>
          </div>
        )}
      </div>
      
      {/* Command results */}
      {commandResult && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Command Result</h4>
          <div className="bg-gray-800 text-gray-200 rounded-md p-3 overflow-x-auto">
            <pre className="text-xs font-mono">{JSON.stringify(commandResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Incident Notes component
const IncidentNotes = ({ selectedDevice, notes, onSaveNote }) => {
  const [newNote, setNewNote] = useState('');
  const [severity, setSeverity] = useState('info');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice || !newNote.trim()) return;
    
    onSaveNote({
      deviceId: selectedDevice.id,
      content: newNote,
      severity,
      timestamp: new Date().toISOString()
    });
    
    // Clear input after submission
    setNewNote('');
    setSeverity('info');
  };
  
  const getSeverityClasses = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'info':
      default:
        return 'bg-primary-100 text-primary-800 border-primary-200';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Incident Notes</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Record observations and findings
        </p>
      </div>
      
      <div className="p-4">
        {selectedDevice ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <div className="mt-1">
                  <textarea
                    id="note-content"
                    name="note-content"
                    rows={3}
                    className="input"
                    placeholder="Enter your observations..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="note-severity" className="block text-sm font-medium text-gray-700">
                  Severity
                </label>
                <select
                  id="note-severity"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newNote.trim()}
                >
                  Save Note
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Please select a device to add notes</p>
          </div>
        )}
        
        {/* Notes list */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Notes</h4>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <div key={index} className={`rounded-md p-3 border ${getSeverityClasses(note.severity)}`}>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{note.severity}</p>
                    <p className="text-xs">{new Date(note.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No notes have been recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Generator component
const ReportGenerator = ({ selectedDevice, onGenerateReport }) => {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('24h');
  const [includeScreenshots, setIncludeScreenshots] = useState(true);
  const [includeProcesses, setIncludeProcesses] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    setGenerating(true);
    
    onGenerateReport({
      deviceId: selectedDevice.id,
      reportType,
      timeRange,
      includeScreenshots,
      includeProcesses
    });
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Report Generator</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Create detailed reports for investigations
        </p>
      </div>
      
      <div className="p-4">
        {selectedDevice ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  id="report-type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="summary">Activity Summary</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="forensic">Forensic Report</option>
                  <option value="incident">Incident Report</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="time-range" className="block text-sm font-medium text-gray-700">
                  Time Range
                </label>
                <select
                  id="time-range"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-700">
                  Include in Report
                </span>
                <div className="flex items-center">
                  <input
                    id="include-screenshots"
                    name="include-screenshots"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={includeScreenshots}
                    onChange={(e) => setIncludeScreenshots(e.target.checked)}
                  />
                  <label htmlFor="include-screenshots" className="ml-2 block text-sm text-gray-900">
                    Screenshots
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-processes"
                    name="include-processes"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={includeProcesses}
                    onChange={(e) => setIncludeProcesses(e.target.checked)}
                  />
                  <label htmlFor="include-processes" className="ml-2 block text-sm text-gray-900">
                    Process History
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Please select a device to generate reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Device Selector component
const DeviceSelector = ({ devices, selectedDeviceId, onSelectDevice }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-4 sm:px-6 border-b">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Select Device</h3>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {devices.length > 0 ? (
          devices.map((device) => (
            <button
              key={device.id}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                selectedDeviceId === device.id ? 'bg-primary-50' : ''
              }`}
              onClick={() => onSelectDevice(device.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.id}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.trustLevel === 'high' ? 'bg-success-100 text-success-800' :
                    device.trustLevel === 'medium' ? 'bg-warning-100 text-warning-800' :
                    'bg-danger-100 text-danger-800'
                  }`}>
                    {device.trustLevel}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No devices available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Control Panel page
const ControlPanelPage = () => {
  const { realtimeData, sendCommand, connected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [commandResult, setCommandResult] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Effect to fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would fetch data from the API
        // For demo purposes, we're just simulating the API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize empty notes array
        setNotes([]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load control panel data');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Select first device if none selected and devices are available
  useEffect(() => {
    if (!selectedDeviceId && realtimeData.devices.length > 0) {
      setSelectedDeviceId(realtimeData.devices[0].id);
    }
  }, [selectedDeviceId, realtimeData.devices]);
  
  // Handle sending commands
  const handleSendCommand = async (commandData) => {
    try {
      const result = await sendCommand(commandData.deviceId, commandData);
      setCommandResult(result);
      
      setAlert({
        type: 'success',
        message: 'Command executed successfully'
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Command error:', err);
      
      setAlert({
        type: 'error',
        message: err.message || 'Failed to execute command'
      });
      
      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };
  
  // Handle saving notes
  const handleSaveNote = async (noteData) => {
    try {
      // In a real application, this would send the note to the API
      // api.saveNote(noteData.deviceId, noteData);
      
      // For demo purposes, just add it to the local state
      setNotes(prev => [noteData, ...prev]);
      
      setAlert({
        type: 'success',
        message: 'Note saved successfully'
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
      
      setAlert({
        type: 'error',
        message: err.message || 'Failed to save note'
      });
      
      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };
  
  // Handle generating reports
  const handleGenerateReport = async (reportOptions) => {
    try {
      // In a real application, this would send the request to the API
      // const report = await api.generateReport(reportOptions.deviceId, reportOptions);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a fake report URL
      const reportUrl = `https://anti5-0.onrender.com/api/reports/${reportOptions.deviceId}-${Date.now()}.pdf`;
      
      setAlert({
        type: 'success',
        message: 'Report generated successfully',
        reportUrl
      });
      
      // In a real app, you might open the report in a new tab
      window.open(reportUrl, '_blank');
      
      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      console.error('Error generating report:', err);
      
      setAlert({
        type: 'error',
        message: err.message || 'Failed to generate report'
      });
      
      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };
  
  // Get selected device
  const selectedDevice = realtimeData.devices.find(d => d.id === selectedDeviceId);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Control Panel</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage devices, send commands, and generate reports
              </p>
            </div>
            
            {/* Connection status alert */}
            {!connected && (
              <AlertBanner
                title="Connection Error"
                message="You are currently disconnected from the control service. Some features may not work properly."
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
              <Loading message="Loading control panel..." />
            ) : error ? (
              <AlertBanner
                title="Error"
                message={error}
                severity="error"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Device selector */}
                <div className="lg:col-span-1">
                  <DeviceSelector
                    devices={realtimeData.devices}
                    selectedDeviceId={selectedDeviceId}
                    onSelectDevice={setSelectedDeviceId}
                  />
                </div>
                
                {/* Control panel sections */}
                <div className="lg:col-span-3 space-y-6">
                  <CommandCenter
                    selectedDevice={selectedDevice}
                    onCommand={handleSendCommand}
                    commandResult={commandResult}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <IncidentNotes
                      selectedDevice={selectedDevice}
                      notes={notes}
                      onSaveNote={handleSaveNote}
                    />
                    
                    <ReportGenerator
                      selectedDevice={selectedDevice}
                      onGenerateReport={handleGenerateReport}
                    />
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

export default ControlPanelPage;