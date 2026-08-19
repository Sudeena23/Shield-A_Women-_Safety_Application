import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Custom hook for managing User Authentication state.
 * Encapsulates currentUser, login, signup, and logout logic.
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial authenticated user from service / local storage
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const signup = async (userData) => {
    const user = await authService.signup(userData);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return {
    currentUser,
    setCurrentUser,
    loading,
    login,
    signup,
    logout,
  };
};
