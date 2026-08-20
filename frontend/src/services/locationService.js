import {
  connectSocket,
  disconnectSocket,
  sendLocation,
} from "./socketService";

export const locationService = {
  // Get quick current GPS location with high accuracy
  getCurrentLocation: () => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        return resolve({
          lat: 27.7172,
          lng: 85.3240,
          accuracy: 10,
          address: "Kathmandu Central, Nepal",
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 10),
            address: `GPS: ${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E`,
          });
        },
        (err) => {
          console.warn("GPS lock fallback:", err.message);
          resolve({
            lat: 27.7172,
            lng: 85.3240,
            accuracy: 15,
            address: "Kathmandu, Nepal",
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  },

  startTrackingLocation: (
    userId,
    onLocationChange,
    onError
  ) => {
    if (!navigator.geolocation) {
      onError?.("Geolocation is not supported by this browser.");
      return null;
    }

    connectSocket();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          userId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(
            position.coords.accuracy || 5
          ),
          timestamp: new Date().toISOString(),
        };

        console.log("My location:", location);

        // Update user's own map
        onLocationChange?.(location);

        // Send location to backend
        sendLocation(location);
      },

      (error) => {
        console.error(
          "Location error:",
          error.message
        );

        onError?.(error.message);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    return watchId;
  },

  stopTrackingLocation: (watchId) => {
    if (
      watchId !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchId);
    }

    disconnectSocket();
  },
};