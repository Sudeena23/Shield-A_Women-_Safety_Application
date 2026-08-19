import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

let lastAlertTime = Number(localStorage.getItem('shield_last_alert_timestamp')) || 0;
const alertsCollection = collection(db, 'alerts');
const withId = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

export const alertService = {
  getAlerts: async () => {
    if (!auth.currentUser) return [];
    try {
      return withId(await getDocs(query(alertsCollection, orderBy('triggeredAt', 'desc'))));
    } catch (error) {
      // Allows a new Firestore project to work before the first composite/index
      // configuration is deployed.
      return withId(await getDocs(alertsCollection));
    }
  },

  getUserAlertCount: async (userId) => {
    const alerts = await alertService.getAlerts();
    return userId ? alerts.filter((alert) => alert.userId === userId).length : alerts.length;
  },

  createAlert: async (alertData) => {
    if (!auth.currentUser) throw new Error('Sign in before sending an SOS alert.');
    const now = Date.now();
    const cooldown = 2 * 60 * 1000;
    if (now - lastAlertTime < cooldown) {
      throw new Error(`Please wait before sending another alert. Cooldown active (${Math.ceil((cooldown - (now - lastAlertTime)) / 1000)}s remaining).`);
    }

    const triggeredAt = new Date().toISOString();
    const data = {
      type: alertData.type || 'SOS Alert',
      title: alertData.title || 'Emergency SOS Broadcast Dispatched',
      timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      location: alertData.location || 'Location unavailable',
      status: alertData.status || 'Active',
      user: alertData.user || auth.currentUser.email || 'Shield User',
      userId: auth.currentUser.uid,
      victimName: alertData.victimName || alertData.user || auth.currentUser.email || 'Shield User',
      victimPhone: alertData.victimPhone || alertData.userPhone || '',
      recipientsCount: alertData.recipientsCount || 0,
      lat: alertData.lat || null,
      lng: alertData.lng || null,
      details: alertData.details || 'SOS activated by user press in Shield Mobile Portal',
      triggeredAt,
      duressActivated: Boolean(alertData.duressActivated),
    };
    const created = await addDoc(alertsCollection, data);
    lastAlertTime = now;
    localStorage.setItem('shield_last_alert_timestamp', String(now));
    return { id: created.id, ...data };
  },

  updateAlertStatus: async (alertId, status) => {
    await updateDoc(doc(db, 'alerts', alertId), { status });
    return { id: alertId, status };
  },

  resolveAlert: (alertId) => alertService.updateAlertStatus(alertId, 'Resolved'),
};
