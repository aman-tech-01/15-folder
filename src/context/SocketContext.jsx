import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [lockdownAlert, setLockdownAlert] = useState(null);
  const [liveActivities, setLiveActivities] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[SocketContext] Connected to real-time event bus.');
      if (user?._id) {
        newSocket.emit('user:join', user._id);
      }
    });

    newSocket.on('activity:new', (activity) => {
      setLiveActivities(prev => [activity, ...prev.slice(0, 29)]);
    });

    newSocket.on('system:emergency', (data) => {
      if (data.emergencyMode) {
        setEmergencyAlert(data);
      } else {
        setEmergencyAlert(null);
      }
    });

    newSocket.on('system:lockdown', (data) => {
      if (data.lockdown) {
        setLockdownAlert(data);
      } else {
        setLockdownAlert(null);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  const clearEmergencyAlert = () => setEmergencyAlert(null);
  const clearLockdownAlert = () => setLockdownAlert(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        emergencyAlert,
        lockdownAlert,
        liveActivities,
        unreadNotificationCount,
        setUnreadNotificationCount,
        clearEmergencyAlert,
        clearLockdownAlert
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
