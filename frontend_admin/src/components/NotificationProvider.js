import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children, adminId }) => {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const socket = io('http://localhost:5000'); // Update with your backend URL
    socket.emit('registerAdmin', adminId);
    socket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });
    return () => socket.disconnect();
  }, [adminId]);
  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
