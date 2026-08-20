import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const sendLocation = (locationData) => {
  if (!socket.connected) socket.connect();
  socket.emit("share-location", locationData);
};

export const listenForLocation = (callback) => {
  socket.on("location-update", callback);
};

export const stopListeningForLocation = () => {
  socket.off("location-update");
};

export const listenForAlerts = (onNewAlert, onAlertResolved) => {
  if (onNewAlert) socket.on("new-sos-alert", onNewAlert);
  if (onAlertResolved) socket.on("alert-resolved", onAlertResolved);
};

export const stopListeningForAlerts = () => {
  socket.off("new-sos-alert");
  socket.off("alert-resolved");
};