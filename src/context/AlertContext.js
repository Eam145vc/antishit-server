import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertSettings, setAlertSettings] = useState({
    emailNotifications: true,
    soundEnabled: true,
    desktopNotifications: true,
    thresholds: {
      deviceChange: 'medium',
      suspiciousProcess: 'high',
      behaviorAnomaly: 'high'
    }
  });

  // Fetch alerts from API
  const fetchAlerts = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlerts(options);
      setAlerts(data.alerts || []);
      return data;
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts. Please try again.');
      return { alerts: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update alert status
  const updateAlertStatus = useCallback(async (alertId, status) => {
    try {
      const updatedAlert = await api.updateAlertStatus(alertId, status);
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
      
      return updatedAlert;
    } catch (err) {
      console.error('Failed to update alert status:', err);
      throw new Error('Failed to update alert status');
    }
  }, []);

  // Mark alert as read
  const markAsRead = useCallback(async (alertId) => {
    return updateAlertStatus(alertId, 'read');
  }, [updateAlertStatus]);

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId) => {
    return updateAlertStatus(alertId, 'dismissed');
  }, [updateAlertStatus]);

  // Update alert settings
  const updateAlertSettings = useCallback(async (newSettings) => {
    try {
      await api.configureAlertSettings(newSettings);
      setAlertSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (err) {
      console.error('Failed to update alert settings:', err);
      throw new Error('Failed to update alert settings');
    }
  }, []);

  // Play alert sound
  const playAlertSound = useCallback((severity = 'medium') => {
    if (!alertSettings.soundEnabled) return;
    
    const audioFiles = {
      low: '/assets/sounds/alert-low.mp3',
      medium: '/assets/sounds/alert-medium.mp3',
      high: '/assets/sounds/alert-high.mp3'
    };
    
    const audio = new Audio(audioFiles[severity] || audioFiles.medium);
    audio.play().catch(err => console.error('Failed to play alert sound:', err));
  }, [alertSettings.soundEnabled]);

  // Show desktop notification
  const showDesktopNotification = useCallback((title, options = {}) => {
    if (!alertSettings.desktopNotifications) return;
    
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, options);
          }
        });
      }
    }
  }, [alertSettings.desktopNotifications]);

  // Listen for new alerts from socket
  useEffect(() => {
    const handleNewAlert = (event) => {
      const alertData = event.detail;
      
      // Add to local state
      setAlerts(prev => [alertData, ...prev]);
      
      // Play sound if enabled
      playAlertSound(alertData.severity);
      
      // Show desktop notification if enabled
      showDesktopNotification('New Alert', {
        body: alertData.message,
        icon: '/assets/images/alert-icon.png'
      });
    };
    
    window.addEventListener('new-alert', handleNewAlert);
    
    return () => {
      window.removeEventListener('new-alert', handleNewAlert);
    };
  }, [playAlertSound, showDesktopNotification]);

  // Initial fetch of alerts
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Context value
  const value = {
    alerts,
    loading,
    error,
    alertSettings,
    fetchAlerts,
    markAsRead,
    dismissAlert,
    updateAlertSettings,
    playAlertSound,
    showDesktopNotification
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};