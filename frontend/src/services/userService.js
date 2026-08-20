import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/admin/users`;

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const userService = {
  // GET ALL USERS
  getUsers: async () => {
    const token = getToken();
    if (!token) {
      return [];
    }

    try {
      const response = await axios.get(API_URL, {
        headers: getHeaders(),
      });

      return response.data.users || [];
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return [];
      }
      console.warn("Notice loading users:", error.message);
      return [];
    }
  },

  // GET USER BY ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${userId}`,
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting user:", error);

      if (error.response?.status === 404) {
        return null;
      }

      throw new Error(
        error.response?.data?.message ||
          "Failed to get user"
      );
    }
  },

  // ACTIVATE / SUSPEND USER
  toggleUserStatus: async (userId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${userId}/suspend`,
        {},
        {
          headers: getHeaders(),
        }
      );

      return response.data.user;
    } catch (error) {
      console.error(
        "Error changing user status:",
        error
      );

      throw new Error(
        error.response?.data?.message ||
          "Failed to change user status"
      );
    }
  },

  // ADD USER
  addUser: async (userData) => {
    try {
      const data = {
        ...userData,
        role: userData.role || "user",
        status: "Active",
      };

      const response = await axios.post(
        API_URL,
        data,
        {
          headers: getHeaders(),
        }
      );

      return response.data.user;
    } catch (error) {
      console.error("Error adding user:", error);

      throw new Error(
        error.response?.data?.message ||
          "Failed to add user"
      );
    }
  },

  // UPDATE USER (Edit)
  updateUser: async (userId, updatedFields) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${userId}`,
        updatedFields,
        {
          headers: getHeaders(),
        }
      );

      return response.data.user;
    } catch (error) {
      console.error("Error updating user:", error);

      throw new Error(
        error.response?.data?.message ||
          "Failed to update user"
      );
    }
  },

  // DELETE USER
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${userId}`,
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);

      throw new Error(
        error.response?.data?.message ||
          "Failed to delete user"
      );
    }
  },
};