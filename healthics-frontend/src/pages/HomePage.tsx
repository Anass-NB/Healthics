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
  Tabs,
  ThemeIcon,
  Flex
} from '@mantine/core';
import { 
  IconCalendar, 
  IconFileReport, 
  IconHistory, 
  IconCalculator, 
  IconShare,
  IconUserPlus,
  IconUserCheck,
  IconMessage
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Landing page for non-authenticated users
  const LandingPage = () => (
    <Box>
      {/* Hero Section */}
      <Box sx={(theme) => ({
        backgroundColor: theme.colors.blue[6],
        color: 'white',
        padding: '3rem 0',
        borderRadius: '0 0 30px 30px',
      })}>
        <Container size="lg">
          <Stack spacing="xl" align="center" my={40}>
            <Title order={1} size={rem(48)} ta="center">
              Welcome to Healthics
            </Title>
            <Text c="white" size="lg" maw={700} ta="center" mx="auto">
              Your secure platform for storing and managing medical documents.
              Keep all your health records in one secure place.
            </Text>
            <Group justify="center" mt="xl">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                sx={{ borderRadius: '25px' }}
                variant="filled"
                color="white"
                c="blue.6"
              >
                Sign In
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/register')}
                sx={{ borderRadius: '25px' }}
                color="white"
              >
                Create Account
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container size="lg" my={50}>
        <Stack spacing={40}>
          <Title order={2} size={rem(36)} ta="center">
            Register for free and benefit from multiple advantages
          </Title>
          
          <Tabs defaultValue="patients" color="blue" radius="xl" variant="pills">
            <Tabs.List position="center" mb={30}>
              <Tabs.Tab value="patients" fw={500}>Patients</Tabs.Tab>
              <Tabs.Tab value="admin" fw={500}>Healthcare Providers</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="patients">
              <Box mb={30}>
                <Text size="lg" ta="center" maw={800} mx="auto">
                  Healthics is an innovative health platform that allows you to retrieve your test results 
                  and medical reports online through our partner laboratories and physicians. The platform 
                  also allows you to digitize and keep a history of your medical records.
                </Text>
              </Box>
              
              <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing={20}>
                <FeatureCard
                  number="01"
                  title="Appointment Scheduling"
                  description="Book appointments online or at home"
                  icon={<IconCalendar size={24} />}
                />
                
                <FeatureCard
                  number="02"
                  title="Medical Results"
                  description="Access test results and medical reports"
                  icon={<IconFileReport size={24} />}
                />
                
                <FeatureCard
                  number="03"
                  title="Digital Records"
                  description="Digitize and maintain your medical history"
                  icon={<IconHistory size={24} />}
                />
                
                <FeatureCard
                  number="04"
                  title="Cost Estimates"
                  description="Request quotes for medical services"
                  icon={<IconCalculator size={24} />}
                />
                
                <FeatureCard
                  number="05"
                  title="Share Records"
                  description="Securely share with your physician"
                  icon={<IconShare size={24} />}
                />
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="admin">
              <Box mb={30}>
                <Text size="lg" ta="center" maw={800} mx="auto">
                  Healthics is an innovative health platform that allows healthcare providers to manage
                  patient records, test results, and schedules in one secure place. Streamline your
                  practice with our comprehensive digital tools.
                </Text>
              </Box>
              
              <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={20}>
                <FeatureCard
                  number="01"
                  title="Patient Management"
                  description="Manage appointments and patient records"
                  icon={<IconUserPlus size={24} />}
                />
                
                <FeatureCard
                  number="02"
                  title="Results Management"
                  description="Upload and manage test results and reports"
                  icon={<IconFileReport size={24} />}
                />
                
                <FeatureCard
                  number="03"
                  title="Digital History"
                  description="Access complete patient medical history"
                  icon={<IconUserCheck size={24} />}
                />
              </SimpleGrid>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="center">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              sx={{ borderRadius: '25px' }}
            >
              Register Now
            </Button>
          </Group>
        </Stack>
      </Container>
      
      {/* Contact Section */}
      <Container size="lg" my={60}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30}>
          <ContactCard
            icon={<IconMessage size={24} />}
            title="Need more information?"
            content=""
          />
          
          <ContactCard
            title="+1 800 HEALTH"
            content=""
          />
          
          <ContactCard
            title="contact@healthics.com"
            content=""
          />
        </SimpleGrid>
      </Container>
      
      {/* Mobile App Section */}
      <Box sx={(theme) => ({
        backgroundColor: theme.colors.blue[6],
        color: 'white',
        padding: '3rem 0',
      })}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
            <Stack spacing="md" justify="center">
              <Title order={1}>HEALTHICS ON YOUR SMARTPHONE</Title>
              <Text size="lg">
                Healthics is an innovative health platform that allows you to digitize your entire
                healthcare journey from scheduling physical appointments, telemedicine, or home visits
                to receiving your medical records online.
                Access our services anytime from your mobile application.
              </Text>
              <Text size="sm" mt="md">
                AVAILABLE ON:
              </Text>
              <Group>
                <Button variant="white" color="dark">Google Play</Button>
                <Button variant="white" color="dark">App Store</Button>
              </Group>
            </Stack>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {/* Here you would place a phone mockup image */}
              <Box 
                sx={{ 
                  width: 280, 
                  height: 500, 
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  border: '10px solid #333',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: '#0083c6', 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px',
                  }}
                >
                  <Text color="white" fw={700} mb={30}>My Account</Text>
                  <SimpleGrid cols={2} spacing="xs">
                    {['Profile', 'Documents', 'Results', 'History', 'Settings', 'Support'].map((item) => (
                      <Box 
                        key={item}
                        sx={{ 
                          backgroundColor: 'white', 
                          padding: '15px 10px',
                          borderRadius: 10,
                          textAlign: 'center',
                          width: 110,
                          height: 80,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            marginBottom: 5
                          }} 
                        />
                        <Text size="xs" fw={500} color="dark">{item}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );

  // For authenticated users (based on your original code)
  const AuthenticatedHome = () => (
    <Container size="lg">
      <Stack spacing="xl">
        {isAdmin() ? (
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

  return user ? <AuthenticatedHome /> : <LandingPage />;
};

// Feature card component for the landing page
const FeatureCard = ({ number, title, description, icon }) => (
  <Card 
    p="lg" 
    radius="md" 
    sx={(theme) => ({
      backgroundColor: theme.colors.blue[6],
      color: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    })}
  >
    <ThemeIcon 
      size={60} 
      radius={30} 
      color="blue.9" 
      variant="light"
      mb="sm"
    >
      {icon}
    </ThemeIcon>
    
    <Title order={3} size="h2" mb="xs" fw={700}>
      {number}
    </Title>
    
    <Text fw={500} mb="xs">
      {title}
    </Text>
    
    <Text size="sm">
      {description}
    </Text>
  </Card>
);

// Contact card component
const ContactCard = ({ icon, title, content }) => (
  <Card p="lg" radius="md" withBorder>
    <Stack align="center" spacing="sm">
      {icon && (
        <ThemeIcon size={50} radius={25} color="blue">
          {icon}
        </ThemeIcon>
      )}
      <Title order={4}>{title}</Title>
      {content && <Text>{content}</Text>}
    </Stack>
  </Card>
);

export default HomePage;