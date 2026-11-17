import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('spendora_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokens && !user) {
      api.get('/auth/profile/')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('spendora_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        });
    }
  }, [tokens]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { user: userData, tokens: tokenData } = res.data;
      setUser(userData);
      setTokens(tokenData);
      localStorage.setItem('spendora_user', JSON.stringify(userData));
      localStorage.setItem('spendora_tokens', JSON.stringify(tokenData));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.non_field_errors?.[0] ||
                      err.response?.data?.detail ||
                      err.response?.data?.[0] ||
                      'Invalid email or password.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      const { user: userData, tokens: tokenData } = res.data;
      setUser(userData);
      setTokens(tokenData);
      localStorage.setItem('spendora_user', JSON.stringify(userData));
      localStorage.setItem('spendora_tokens', JSON.stringify(tokenData));
      return { success: true };
    } catch (err) {
      let message = 'Registration failed. Please check the form.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.email) message = errors.email[0];
        else if (errors.confirm_password) message = errors.confirm_password[0];
        else if (errors.password) message = errors.password[0];
        else if (errors.name) message = errors.name[0];
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('spendora_user');
      localStorage.removeItem('spendora_tokens');
    }
  };

  const quickDemoLogin = async () => {
    return login('elakiya@spendora.app', 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens?.access,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
