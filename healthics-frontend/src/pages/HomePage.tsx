import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack, 
  Card, 
  SimpleGrid, 
  rem, 
  Box, 
  ThemeIcon, 
  Flex,
  Image,
  Divider,
  useMantineTheme,
  Paper
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { 
  IconCalendar, 
  IconFolder, 
  IconUpload, 
  IconShare, 
  IconBuildingHospital,
  IconReportMedical,
  IconChartBar,
  IconArrowRight,
  IconUsers,
  IconHeartRateMonitor,
  IconUserCircle,
  IconFileAnalytics,
  IconCloudUpload
} from '@tabler/icons-react';

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  // Features for the public landing page
  const features = [
    {
      icon: IconCalendar,
      title: '01',
      description: 'Consultation Scheduling',
      content: 'Schedule and manage your medical appointments easily'
    },
    {
      icon: IconReportMedical,
      title: '02',
      description: 'Medical Document Access',
      content: 'Access your medical reports and test results securely online'
    },
    {
      icon: IconFolder,
      title: '03',
      description: 'Digital Medical Records',
      content: 'Digitize and maintain a complete history of your medical records'
    },
    {
      icon: IconBuildingHospital,
      title: '04',
      description: 'Healthcare Provider Network',
      content: 'Connect with our network of trusted healthcare providers'
    },
    {
      icon: IconShare,
      title: '05',
      description: 'Medical Record Sharing',
      content: 'Securely share your medical records with your healthcare providers'
    },
  ];

  // Guest landing page with features
  const GuestLanding = () => (
    <>
      <Box 
        py={60} 
        sx={(theme) => ({
          background: `linear-gradient(45deg, ${theme.colors.blue[7]} 0%, ${theme.colors.cyan[7]} 100%)`,
          color: theme.white,
          borderRadius: theme.radius.md
        })}
        mb={40}
      >
        <Container size="lg">
          <Stack spacing="xl" ta="center" mb={40}>
            <Title 
              order={1} 
              size={rem(48)}
              fw={900}
            >
              Welcome to Healthics
            </Title>
            <Text c="white" size="xl" maw={700} mx="auto">
              Your secure platform for managing medical documents and accessing healthcare services from anywhere.
            </Text>
            <Group justify="center" mt="xl">
              <Button 
                size="lg" 
                leftSection={<IconArrowRight size={18} />}
                onClick={() => navigate('/login')}
                radius="xl"
                color="white"
                variant="white"
                c="blue"
              >
                Sign In
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                color="white"
                radius="xl"
                leftSection={<IconUserCircle size={18} />}
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Container size="lg">
        <Title align="center" order={2} mb={50} fw={700}>
          Digitize and manage your complete health journey
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing={30}>
          {features.map((feature, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section bg="blue.6" p="md">
                <Flex justify="space-between" align="center">
                  <Title order={2} c="white" fw={900}>
                    {feature.title}
                  </Title>
                  <ThemeIcon size={40} radius="md" variant="light" color="blue.0">
                    <feature.icon size={24} stroke={1.5} color={theme.colors.blue[6]} />
                  </ThemeIcon>
                </Flex>
              </Card.Section>
              
              <Text fw={700} size="lg" mt="md">
                {feature.description}
              </Text>
              
              <Text mt="xs" c="dimmed" size="sm">
                {feature.content}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Box mt={60} mb={40}>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={40}>
            <Box style={{ flex: 1 }}>
              <Title order={2} mb="md">Healthcare at your fingertips</Title>
              <Text>
                Healthics is an innovative healthcare platform that allows you to digitize your entire healthcare journey,
                from scheduling appointments and managing medical documents to sharing records with healthcare providers.
              </Text>
              <Text mt="md">
                Access your health information anytime, anywhere through our secure platform.
              </Text>
              <Button 
                mt="xl" 
                size="lg" 
                radius="xl"
                rightSection={<IconArrowRight size={18} />}
                onClick={() => navigate('/register')}
              >
                Get Started Now
              </Button>
            </Box>
            <Box style={{ flex: 1 }}>
              <Image 
                src="/images/healthcare-illustration.png" 
                alt="Healthcare illustration"
                radius="md"
              />
            </Box>
          </Flex>
        </Box>
      </Container>
    </>
  );

  // Admin dashboard homepage
  const AdminHome = () => (
    <Stack spacing="xl">
      <Title order={1}>Welcome, Administrator {user.username}</Title>
      <Text size="lg" c="dimmed" mb="lg">
        Manage patient records, documents, and system statistics
      </Text>
      
      <Box 
        py={30} 
        px={20}
        mb={20}
        sx={(theme) => ({
          background: `linear-gradient(45deg, ${theme.colors.indigo[7]} 0%, ${theme.colors.blue[5]} 100%)`,
          borderRadius: theme.radius.md,
          color: theme.white
        })}
      >
        <Flex align="center" gap="md" wrap="wrap">
          <IconChartBar size={48} />
          <div>
            <Text fw={700} size="xl">Admin Dashboard</Text>
            <Text size="sm">Access comprehensive system analytics and management tools</Text>
          </div>
          <Button 
            ml="auto" 
            variant="white" 
            color="indigo" 
            radius="xl"
            onClick={() => navigate('/admin/dashboard')}
          >
            Open Dashboard
          </Button>
        </Flex>
      </Box>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconUsers size={32} color={theme.colors.blue[6]} />
          <Title order={3} mt="md" mb="xs">Manage Patients</Title>
          <Text size="sm" color="dimmed" mb="lg">
            View and manage all patient accounts, profiles, and status
          </Text>
          <Button 
            variant="light" 
            color="blue" 
            fullWidth 
            onClick={() => navigate('/admin/patients')}
          >
            View Patients
          </Button>
        </Paper>
        
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconFileAnalytics size={32} color={theme.colors.violet[6]} />
          <Title order={3} mt="md" mb="xs">Document Management</Title>
          <Text size="sm" color="dimmed" mb="lg">
            Manage all patient medical documents and records
          </Text>
          <Button 
            variant="light" 
            color="violet" 
            fullWidth 
            onClick={() => navigate('/admin/documents')}
          >
            View Documents
          </Button>
        </Paper>
        
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconHeartRateMonitor size={32} color={theme.colors.green[6]} />
          <Title order={3} mt="md" mb="xs">System Health</Title>
          <Text size="sm" color="dimmed" mb="lg">
            Monitor system performance and user activity
          </Text>
          <Button 
            variant="light" 
            color="green" 
            fullWidth 
            onClick={() => navigate('/admin/dashboard')}
          >
            View Statistics
          </Button>
        </Paper>
      </SimpleGrid>
    </Stack>
  );

  // Patient dashboard homepage
  const PatientHome = () => (
    <Stack spacing="xl">
      <Title order={1}>Welcome back, {user.username}</Title>
      <Text c="dimmed" size="lg">
        Manage your health documents and information in one secure place
      </Text>
      
      <Box 
        py={30} 
        px={20}
        mb={20}
        sx={(theme) => ({
          background: `linear-gradient(45deg, ${theme.colors.cyan[7]} 0%, ${theme.colors.blue[5]} 100%)`,
          borderRadius: theme.radius.md,
          color: theme.white
        })}
      >
        <Flex align="center" gap="md" wrap="wrap">
          <IconUserCircle size={48} />
          <div>
            <Text fw={700} size="xl">Your Health Profile</Text>
            <Text size="sm">Keep your medical information up-to-date for better healthcare</Text>
          </div>
          <Button 
            ml="auto" 
            variant="white" 
            color="cyan" 
            radius="xl"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        </Flex>
      </Box>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconFolder size={32} color={theme.colors.blue[6]} />
          <Title order={3} mt="md" mb="xs">My Documents</Title>
          <Text size="sm" color="dimmed" mb="lg">
            Access and manage all your medical documents and records
          </Text>
          <Button 
            variant="light" 
            color="blue" 
            fullWidth 
            onClick={() => navigate('/documents')}
          >
            View Documents
          </Button>
        </Paper>
        
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconCloudUpload size={32} color={theme.colors.teal[6]} />
          <Title order={3} mt="md" mb="xs">Upload Documents</Title>
          <Text size="sm" color="dimmed" mb="lg">
            Add new medical documents to your secure storage
          </Text>
          <Button 
            variant="light" 
            color="teal" 
            fullWidth 
            onClick={() => navigate('/documents/upload')}
          >
            Upload New
          </Button>
        </Paper>
        
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <IconShare size={32} color={theme.colors.indigo[6]} />
          <Title order={3} mt="md" mb="xs">Share Health Data</Title>
          <Text size="sm" color="dimmed" mb="lg">
            Securely share your medical information with healthcare providers
          </Text>
          <Button 
            variant="light" 
            color="indigo" 
            fullWidth 
            onClick={() => navigate('/documents')}
          >
            Manage Sharing
          </Button>
        </Paper>
      </SimpleGrid>
    </Stack>
  );

  return (
    <Container size="lg" py={30}>
      {!user ? <GuestLanding /> : isAdmin() ? <AdminHome /> : <PatientHome />}
    </Container>
  );
};

export default HomePage;