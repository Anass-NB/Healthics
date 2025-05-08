import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Stack, Card, SimpleGrid, rem } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Container size="lg">
      <Stack spacing="xl">
        {!user ? (
          <Stack spacing="lg" my={50} ta="center">
            <Title order={1} size={rem(48)}>
              Welcome to Healthics
            </Title>
            <Text c="dimmed" size="lg" maw={600} mx="auto">
              Your secure platform for storing and managing medical documents. 
              Keep all your health records in one secure place.
            </Text>
            <Group justify="center" mt="xl">
              <Button size="lg" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                Create Account
              </Button>
            </Group>
          </Stack>
        ) : isAdmin() ? (
          // Admin home page
          <>
            <Title order={1}>Welcome, Administrator {user.username}</Title>
            <Text size="lg" c="dimmed" mb="lg">
              Use the admin dashboard to manage patients and system statistics
            </Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md" style={{ borderBottom: '4px solid var(--mantine-color-red-6)' }}>
                  <Title order={3}>Admin Dashboard</Title>
                </Card.Section>
                
                <Text mt="sm" mb="md">
                  Access system statistics, manage patients, and view all documents in the system.
                </Text>
                
                <Button color="red" fullWidth onClick={() => navigate('/admin/dashboard')}>
                  Open Dashboard
                </Button>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md" style={{ borderBottom: '4px solid var(--mantine-color-blue-6)' }}>
                  <Title order={3}>View Documents</Title>
                </Card.Section>
                
                <Text mt="sm" mb="md">
                  View and download documents in your administrative capacity.
                </Text>
                
                <Button variant="light" fullWidth onClick={() => navigate('/documents')}>
                  View Documents
                </Button>
              </Card>
            </SimpleGrid>
          </>
        ) : (
          // Patient home page
          <>
            <Title order={1}>Welcome back, {user.username}</Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Title order={3}>My Profile</Title>
                </Card.Section>
                
                <Text mt="sm" mb="md">
                  View and update your personal and medical information.
                </Text>
                
                <Button variant="light" fullWidth onClick={() => navigate('/profile')}>
                  View Profile
                </Button>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Title order={3}>My Documents</Title>
                </Card.Section>
                
                <Text mt="sm" mb="md">
                  Manage your uploaded medical documents and records.
                </Text>
                
                <Button variant="light" fullWidth onClick={() => navigate('/documents')}>
                  View Documents
                </Button>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Title order={3}>Upload Document</Title>
                </Card.Section>
                
                <Text mt="sm" mb="md">
                  Upload a new medical document to your secure storage.
                </Text>
                
                <Button variant="light" fullWidth onClick={() => navigate('/documents/upload')}>
                  Upload New
                </Button>
              </Card>
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default HomePage;