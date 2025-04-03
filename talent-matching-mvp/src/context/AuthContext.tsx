import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, LoginRequest, RegisterRequest } from '../types';
import { authAPI, userAPI } from '../api/api';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: true,
    error: null,
  });

  // Keep track of whether to skip profile fetching (right after login)
  const [skipProfileFetch, setSkipProfileFetch] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !skipProfileFetch) {
        try {
          const user = await userAPI.getUserProfile();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please log in again.',
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        // Reset skip flag after handling the current state
        if (skipProfileFetch) {
          setSkipProfileFetch(false);
        }
      }
    };

    verifyToken();
  }, [skipProfileFetch]);

  const login = async (data: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authAPI.login(data);

      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      
      // Fetch user profile after receiving token
      try {
        const user = await userAPI.getUserProfile();
        
        setAuthState({
          user,
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Handle error fetching user profile
        localStorage.removeItem('token');
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error fetching user profile. Please try again.',
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials. Please try again.',
      }));
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authAPI.register(data);
      // After registration, log the user in
      await login({ username: data.username, password: data.password });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed. Please try again.',
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 