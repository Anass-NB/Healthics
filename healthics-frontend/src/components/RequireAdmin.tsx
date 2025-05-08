import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay, Container, Alert, Button } from '@mantine/core';

const RequireAdmin = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not an admin, show access denied
  if (!isAdmin()) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Access Denied" mb="md">
          You do not have administrator privileges to access this area.
        </Alert>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </Container>
    );
  }

  // User is an admin, allow access
  return <Outlet />;
};

export default RequireAdmin;