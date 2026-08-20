import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/auth`;

export const authService = {
  // LOGIN
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      // Save JWT token
      localStorage.setItem("token", token);

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      return {
        success: true,
        token,
        user,
      };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error("Cannot connect to Shield server. Please ensure backend is running (port 5000).");
      }
      throw new Error(error.message || "Login failed. Please check your credentials.");
    }
  },

  // REGISTER
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: userData.name,
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone || "",
        bloodGroup: userData.bloodGroup || "O+",
        medicalNotes: userData.medicalNotes || "",
      });

      const { token, user } = response.data;

      // Save JWT token
      localStorage.setItem("token", token);

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      return {
        success: true,
        token,
        user,
      };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error("Cannot connect to Shield server. Please ensure backend is running (port 5000).");
      }
      throw new Error(error.message || "Registration failed. Please check your details.");
    }
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // GET CURRENT USER
  getCurrentUser: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }
  },

  // UPDATE PROFILE
  updateProfile: async (userIdOrData, maybeData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You must be logged in.");
    }

    // Support both updateProfile(userData) and updateProfile(userId, userData)
    const updateData =
      typeof userIdOrData === "object" ? userIdOrData : maybeData || {};
    const targetUrl =
      typeof userIdOrData === "string"
        ? `${API_URL}/profile/${userIdOrData}`
        : `${API_URL}/me`;

    try {
      const response = await axios.put(targetUrl, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },
};