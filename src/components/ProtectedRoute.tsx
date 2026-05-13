import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStatus } from '../hooks/useActiveStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSetup?: boolean;
}

export default function ProtectedRoute({ children, requireSetup = true }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  useActiveStatus();

  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If we require the profile to be setup, and it's not explicitly marked as true
  if (requireSetup && userProfile?.isProfileSetup !== true) {
    return <Navigate to="/profile-setup" state={{ from: location }} replace />;
  }

  // If we don't require setup (meaning we are ON the setup page), but it is setup, send to home
  if (!requireSetup && userProfile?.isProfileSetup === true) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
