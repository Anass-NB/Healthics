import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '@mantine/core';

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />;
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;