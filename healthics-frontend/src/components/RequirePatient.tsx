import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay, Container, Alert, Button } from '@mantine/core';

const RequirePatient = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is an admin, show access denied because these routes are for patients only
  if (isAdmin()) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Access Denied">
          This section is only for patients. Administrators should use the admin dashboard.
        </Alert>
        <Button onClick={() => window.history.back()} mt="md">
          Go Back
        </Button>
      </Container>
    );
  }

  // User is a patient, allow access
  return <Outlet />;
};

export default RequirePatient;