import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const fallbackLocation = (address) => ({ lat: 27.7172, lng: 85.3240, accuracy: 15, address, timestamp: new Date().toISOString(), isFallback: true });

export const locationService = {
  getCurrentLocation: async () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(fallbackLocation('Kathmandu Central, Nepal (location unavailable)'));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({ lat, lng, accuracy: Math.round(position.coords.accuracy || 5), address: `GPS Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°`, timestamp: new Date(position.timestamp || Date.now()).toISOString(), isFallback: false });
      },
      () => resolve(fallbackLocation('Kathmandu, Nepal (browser location access off)')),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }),

  updateLocation: async (locationPayload) => {
    if (!auth.currentUser) throw new Error('Sign in to share your live location.');
    const activeAt = new Date().toISOString();
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'locations', 'current'), { ...locationPayload, activeAt, userId: auth.currentUser.uid }, { merge: true });
    return { success: true, sessionToken: `loc-sess-${auth.currentUser.uid}`, activeAt, location: locationPayload };
  },

  startTrackingLocation: (onLocationChange, onError) => {
    if (!navigator.geolocation) { onError?.('Geolocation not supported in browser'); return null; }
    return navigator.geolocation.watchPosition(
      (pos) => onLocationChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy), address: `GPS Lat: ${pos.coords.latitude.toFixed(4)}°, Lng: ${pos.coords.longitude.toFixed(4)}°`, timestamp: new Date(pos.timestamp).toISOString() }),
      (err) => onError?.(err.message),
      { enableHighAccuracy: true }
    );
  },

  stopTrackingLocation: (watchId) => { if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId); },
};
