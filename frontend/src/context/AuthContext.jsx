import React, { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  if (typeof window === 'undefined') return null;
  const guardado = localStorage.getItem('crm_usuario');
  if (!guardado) return null;

  try {
    return JSON.parse(guardado);
  } catch {
    localStorage.removeItem('crm_usuario');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('crm_token', data.token);
    localStorage.setItem('crm_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  }

  function logout() {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_usuario');
    setUsuario(null);
  }

  return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
