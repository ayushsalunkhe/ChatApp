import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, ApiError } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>, oldPassword?: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize axios with token
  const setAxiosToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAxiosToken(token);
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get<User>(`${API_URL}/auth/me`);
      setCurrentUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setAxiosToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      setAxiosToken(response.data.token);
      setCurrentUser(response.data.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
        name,
        username,
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      setAxiosToken(response.data.token);
      setCurrentUser(response.data.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } finally {
      localStorage.removeItem('token');
      setAxiosToken(null);
      setCurrentUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>, oldPassword?: string) => {
    try {
      setError(null);
      const response = await axios.put<User>(`${API_URL}/users/profile`, {
        ...updates,
        oldPassword
      });
      setCurrentUser(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Profile update failed');
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/users/account`, {
        data: { password }
      });
      localStorage.removeItem('token');
      setAxiosToken(null);
      setCurrentUser(null);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Account deletion failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
