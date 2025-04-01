import React, { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    devices: [],
    processes: {},
    screenshots: {},
    alertsCount: 0
  });
  const { isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    let socketInstance = null;
    
    if (isAuthenticated) {
      // Create socket instance
      socketInstance = io('https://anti5-0.onrender.com', {
        path: '/socket.io',
        auth: {
          token: localStorage.getItem('auth_token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
      });
      
      // Set socket in state
      setSocket(socketInstance);
      
      // Setup event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });
      
      // Handle realtime data updates
      socketInstance.on('device_update', (deviceData) => {
        setRealtimeData(prev => ({
          ...prev,
          devices: [...prev.devices.filter(d => d.id !== deviceData.id), deviceData]
        }));
      });
      
      socketInstance.on('process_update', ({ deviceId, processes }) => {
        setRealtimeData(prev => ({
          ...prev,
          processes: {
            ...prev.processes,
            [deviceId]: processes
          }
        }));
      });
      
      socketInstance.on('screenshot_update', ({ deviceId, screenshot }) => {
        setRealtimeData(prev => ({
          ...prev,
          screenshots: {
            ...prev.screenshots,
            [deviceId]: [
              screenshot,
              ...(prev.screenshots[deviceId] || []).slice(0, 9) // Keep last 10 screenshots
            ]
          }
        }));
      });
      
      socketInstance.on('alert', (alertData) => {
        setRealtimeData(prev => ({
          ...prev,
          alertsCount: prev.alertsCount + 1
        }));
        
        // Use this to notify the AlertContext
        window.dispatchEvent(new CustomEvent('new-alert', { detail: alertData }));
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log('Closing socket connection');
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated]);

  // Request updates for a specific device
  const requestDeviceUpdates = useCallback((deviceId) => {
    if (socket && connected) {
      socket.emit('subscribe_device', { deviceId });
    }
  }, [socket, connected]);
  
  // Request screenshot from a device
  const requestScreenshot = useCallback((deviceId) => {
    if (socket && connected) {
      return new Promise((resolve, reject) => {
        socket.emit('request_screenshot', { deviceId }, (response) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to request screenshot'));
          }
        });
      });
    }
    return Promise.reject(new Error('Socket not connected'));
  }, [socket, connected]);

  // Context value
  const value = {
    socket,
    connected,
    realtimeData,
    requestDeviceUpdates,
    stopDeviceUpdates,
    sendCommand,
    requestScreenshot
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

  // Stop updates for a specific device
  const stopDeviceUpdates = useCallback((deviceId) => {
    if (socket && connected) {
      socket.emit('unsubscribe_device', { deviceId });
    }
  }, [socket, connected]);

  // Send a command to a device
  const sendCommand = useCallback((deviceId, command) => {
    if (socket && connected) {
      return new Promise((resolve, reject) => {
        socket.emit('device_command', { deviceId, command }, (response) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to send command'));
          }
        });
      });
    }
    return Promise.reject(new Error('Socket not connected'));
  }, [socket, connected]);