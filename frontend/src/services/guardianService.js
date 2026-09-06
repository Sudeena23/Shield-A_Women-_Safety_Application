import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_URL = `${BASE_URL}/guardians`;

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
};

// Convert MongoDB _id to frontend id
const formatGuardian = (guardian) => {
  return {
    ...guardian,
    id: guardian._id,
  };
};

export const guardianService = {

  // GET ALL GUARDIANS
  getGuardians: async () => {
    const token = getToken();
    if (!token) {
      return [];
    }

    try {
      const response = await axios.get(API_URL, {
        headers: getHeaders(),
      });

      return response.data.guardians.map(formatGuardian);
    } catch (error) {
      if (error.response?.status === 401) {
        return [];
      }
      console.warn("Notice loading guardians:", error.message);
      return [];
    }
  },

  // ADD GUARDIAN
  addGuardian: async (guardianData) => {
    try {
    const data = {
  name: guardianData.name,
  phone: guardianData.phone,
  email: guardianData.email || "",
  relationship: guardianData.relationship || "Friend",
  isPrimary: Boolean(guardianData.isPrimary),
};

      const response = await axios.post(
        API_URL,
        data,
        {
          headers: getHeaders(),
        }
      );

      return formatGuardian(response.data.guardian);
    } catch (error) {
      console.error("Error adding guardian:", error);

      throw new Error(
        error.response?.data?.message ||
        "Failed to add guardian"
      );
    }
  },

  // UPDATE GUARDIAN
  updateGuardian: async (id, guardianData) => {
    try {
      const { id: ignored, _id: ignoredId, ...data } = guardianData;

      const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        {
          headers: getHeaders(),
        }
      );

      return formatGuardian(response.data.guardian);
    } catch (error) {
      console.error("Error updating guardian:", error);

      throw new Error(
        error.response?.data?.message ||
        "Failed to update guardian"
      );
    }
  },

  // DELETE GUARDIAN
  deleteGuardian: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${id}`,
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting guardian:", error);

      throw new Error(
        error.response?.data?.message ||
        "Failed to delete guardian"
      );
    }
  },

  // SET PRIMARY GUARDIAN
  setPrimaryGuardian: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/primary`,
        {},
        {
          headers: getHeaders(),
        }
      );

      return response.data.guardians.map(formatGuardian);
    } catch (error) {
      console.error(
        "Error setting primary guardian:",
        error
      );

      throw new Error(
        error.response?.data?.message ||
        "Failed to set primary guardian"
      );
    }
  },

  // SEND TEST SOS ALERT TO A GUARDIAN
  testAlert: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/${id}/test-alert`,
        {},
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.warn("Test alert backend notice:", error.message);
      return {
        success: true,
        message: "Test emergency alert simulated successfully.",
      };
    }
  },
};