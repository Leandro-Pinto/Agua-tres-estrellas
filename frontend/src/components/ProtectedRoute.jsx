import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { usuario } = useAuth() || {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm_token') : null;
  const autenticado = Boolean(usuario || token);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
