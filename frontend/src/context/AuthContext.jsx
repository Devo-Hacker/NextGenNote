import { useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContextStore';
import { saveAccount, updateSavedAccountUser } from '../utils/accounts';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      return JSON.parse(storedUser);
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    saveAccount(res.data.token, res.data.user);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    saveAccount(res.data.token, res.data.user);
    setUser(res.data.user);
  };

  const switchAccount = (token, switchedUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(switchedUser));
    setUser(switchedUser);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      updateSavedAccountUser(updated.email, updated);
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, switchAccount, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};