import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  TextInput, 
  PasswordInput, 
  Button, 
  Text, 
  Stack, 
  Anchor, 
  Alert,
  Group,
  Divider,
  Box,
  useMantineTheme,
  Image,
  Flex,
  ThemeIcon,
  rem
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import { 
  IconLock, 
  IconUser, 
  IconAlertCircle, 
  IconHeartbeat, 
  IconShieldCheck,
  IconKey
} from '@tabler/icons-react';

interface LocationState {
  from: {
    pathname: string;
  };
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();

  // Get the page they were trying to visit before getting redirected to login
  const from = (location.state as LocationState)?.from?.pathname || '/';
  
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      notifications.show({
        title: 'Success',
        message: 'You have been logged in successfully',
        color: 'green',
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the Auth context
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: IconHeartbeat,
      title: 'Your Health, Our Priority',
      description: 'Access your medical documents securely anywhere, anytime.'
    },
    {
      icon: IconShieldCheck,
      title: 'Secure Data Protection',
      description: 'Industry-leading security standards to keep your data safe.'
    }
  ];

  return (
    <Container size="xl" py={40}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 30, md: 50 }}
        justify="space-between"
        align="center"
      >
        {/* Left side - Login form */}
        <Box w={{ base: '100%', md: '45%' }}>
          <Paper 
            withBorder 
            shadow="md" 
            p={30} 
            radius="md" 
            sx={{ 
              borderTop: `4px solid ${theme.colors.blue[6]}`,
              position: 'relative'
            }}
          >
            <ThemeIcon 
              size={60} 
              radius="xl" 
              color="blue" 
              style={{ 
                position: 'absolute',
                top: -30,
                left: 'calc(50% - 30px)'
              }}
            >
              <IconKey size={30} />
            </ThemeIcon>
            
            <Title ta="center" mt={30} order={2}>
              Welcome Back
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5} mb={20}>
              Sign in to access your health information
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                {error && (
                  <Alert 
                    icon={<IconAlertCircle size={16} />} 
                    color="red" 
                    withCloseButton 
                    onClose={clearError}
                  >
                    {error}
                  </Alert>
                )}

                <TextInput
                  required
                  label="Username"
                  placeholder="Your username"
                  icon={<IconUser size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('username')}
                />

                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  icon={<IconLock size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('password')}
                />

                <Button 
                  fullWidth 
                  mt="xl" 
                  type="submit" 
                  loading={loading}
                  size="md"
                  radius="xl"
                >
                  Sign in
                </Button>
              </Stack>
            </form>

            <Divider label="Don't have an account?" labelPosition="center" my="lg" />

            <Group grow>
              <Button 
                component={Link} 
                to="/register"
                variant="outline"
                radius="xl"
                size="md"
              >
                Create Account
              </Button>
            </Group>
          </Paper>
        </Box>

        {/* Right side - Features and image */}
        <Box w={{ base: '100%', md: '50%' }} ta="center">
          <Box>
            <Title order={2} mb={rem(30)} color="blue.7">
              Healthics
            </Title>
            <Text mb={rem(30)} size="lg">
              Your secure platform for managing your medical documents
            </Text>
            
            <Image 
              src="/images/login-illustration.png" 
              radius="md"
              mb={rem(30)}
              style={{ maxWidth: 400, margin: '0 auto' }}
            />

            <Stack>
              {features.map((feature, i) => (
                <Group key={i} align="flex-start" noWrap>
                  <ThemeIcon 
                    size={50} 
                    radius="md" 
                    variant="light" 
                    color="blue"
                  >
                    <feature.icon size={26} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700}>{feature.title}</Text>
                    <Text size="sm" c="dimmed">{feature.description}</Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default LoginPage;