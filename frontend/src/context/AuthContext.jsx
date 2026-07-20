import { useState} from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContextStore';


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
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};