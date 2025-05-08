import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get('/users/profile')
        .then((res) => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const profileRes = await api.get('/users/profile');
    setUser(profileRes.data.user);
  };

  const register = async (name, email, password, role, location) => {
    const res = await api.post('/auth/register', { name, email, password, role, location });
    localStorage.setItem('token', res.data.token);
    const profileRes = await api.get('/users/profile');
    setUser(profileRes.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}