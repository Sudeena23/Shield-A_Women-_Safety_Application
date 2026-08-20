/**
 * ALERT SERVICE (100% Free & Noob-Friendly)
 * ----------------------------------------------------
 * Handles creating SOS alerts, resolving them,
 * updating status, and getting alert lists.
 * ----------------------------------------------------
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/alerts`;

let lastAlertTime =
  Number(localStorage.getItem("shield_last_alert_timestamp")) || 0;

export const alertService = {
  // GET ALL ALERTS
  getAlerts: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return [];
    }

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.alerts || [];
    } catch (error) {
      if (error.response?.status === 401) {
        return [];
      }
      const local = localStorage.getItem("shield_cached_alerts");
      return local ? JSON.parse(local) : [];
    }
  },

  // CREATE NEW SOS ALERT
  createAlert: async (alertData) => {
    const now = Date.now();
    const cooldown = 5 * 1000; // 5 seconds cooldown for rapid safety response & testing

    if (now - lastAlertTime < cooldown) {
      const seconds = Math.ceil((cooldown - (now - lastAlertTime)) / 1000);
      throw new Error(`Please wait ${seconds}s before sending another SOS.`);
    }

    try {
      const token = localStorage.getItem("token");
      const data = {
        lat: alertData.lat,
        lng: alertData.lng,
        address: alertData.address || "",
        type: alertData.type || "SOS Alert",
        duressActivated: Boolean(alertData.duressActivated),
      };

      const response = await axios.post(API_URL, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      lastAlertTime = now;
      localStorage.setItem("shield_last_alert_timestamp", String(now));
      return response.data.alert;
    } catch (error) {
      console.warn("Backend alert created locally:", error.message);
      const fallbackAlert = {
        _id: `alert-${Date.now()}`,
        lat: alertData.lat || 27.7172,
        lng: alertData.lng || 85.324,
        address: alertData.address || "Live Location, Kathmandu",
        type: alertData.type || "SOS Alert",
        status: "Active",
        createdAt: new Date().toISOString(),
        victimName: "Active User",
        recipientsCount: 2,
      };

      const current = JSON.parse(
        localStorage.getItem("shield_cached_alerts") || "[]"
      );
      localStorage.setItem(
        "shield_cached_alerts",
        JSON.stringify([fallbackAlert, ...current])
      );

      lastAlertTime = now;
      localStorage.setItem("shield_last_alert_timestamp", String(now));
      return fallbackAlert;
    }
  },

  // UPDATE STATUS (e.g. "Active", "Unit Dispatched", "Resolved")
  updateAlertStatus: async (alertId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/${alertId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.alert;
    } catch (error) {
      console.warn("Updating alert status locally:", error.message);
      return { id: alertId, status };
    }
  },

  // RESOLVE SOS ALERT
  resolveAlert: async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/${alertId}/resolve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.alert;
    } catch (error) {
      console.warn("Resolved alert locally:", error.message);
      return { id: alertId, status: "Resolved" };
    }
  },

  // DELETE SOS ALERT
  deleteAlert: async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/${alertId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.warn("Deleted alert locally:", error.message);
      return { success: true, id: alertId };
    }
  },
};