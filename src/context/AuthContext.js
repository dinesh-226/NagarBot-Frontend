import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN': return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT': return { user: null, token: null, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
};

const normalizeUser = (u) => ({
  id: u.id || u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  karma: u.karma || 0,
  department: u.department || null,
  phone: u.phone || null,
  city: u.city || null,
  pincode: u.pincode || null,
  avatarUrl: u.avatarUrl || null,
  bio: u.bio || null,
  createdAt: u.createdAt || null,
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null, token: localStorage.getItem('token'), loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => dispatch({ type: 'LOGIN', payload: { user: normalizeUser(data), token } }))
        .catch(() => { localStorage.removeItem('token'); dispatch({ type: 'LOGOUT' }); });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    dispatch({ type: 'LOGIN', payload: { user: normalizeUser(data.user), token: data.token } });
  };

  const updateUser = (fields) => dispatch({ type: 'UPDATE_USER', payload: fields });

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
