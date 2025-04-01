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

  // Función para detener actualizaciones de dispositivos
  const stopDeviceUpdates = useCallback((deviceId) => {
    if (socket && connected) {
      socket.emit('unsubscribe_device', { deviceId });
    }
  }, [socket, connected]);

  // Función para enviar comandos
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

  // Función para solicitar actualizaciones de dispositivos
  const requestDeviceUpdates = useCallback((deviceId) => {
    if (socket && connected) {
      socket.emit('subscribe_device', { deviceId });
    }
  }, [socket, connected]);
  
  // Función para solicitar captura de pantalla
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

  // Inicializar conexión de socket
  useEffect(() => {
    let socketInstance = null;
    
    if (isAuthenticated) {
      // Crear instancia de socket
      socketInstance = io('https://anti5-0.onrender.com', {
        path: '/socket.io',
        auth: {
          token: localStorage.getItem('auth_token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
      });
      
      // Establecer socket en estado
      setSocket(socketInstance);
      
      // Configurar escuchas de eventos
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
      
      // Manejar actualizaciones de datos en tiempo real
      socketInstance.on('device_update', (deviceData) => {
        setRealtimeData(prev => ({
          ...prev,
          devices: [...prev.devices.filter(d => d.id !== deviceData.id), deviceData]
        }));
      });
      
      // Resto del código de eventos de socket...
    }
    
    // Limpieza al desmontar
    return () => {
      if (socketInstance) {
        console.log('Cerrando conexión de socket');
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated]);

  // Valor de contexto
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
