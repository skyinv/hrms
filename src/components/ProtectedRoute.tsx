import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  isAdminRoute?: boolean;
}

export default function ProtectedRoute({ children, isAdminRoute = false }: Props) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/employee" />;
  }

  if (!isAdminRoute && isAdmin) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}