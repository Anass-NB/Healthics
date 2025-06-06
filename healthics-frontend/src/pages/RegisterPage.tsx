import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  TextInput, 
  PasswordInput, 
  Button, 
  Text, 
  Stack, 
  Alert,
  Group,
  Divider,
  Box,
  useMantineTheme,
  Image,
  Flex,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import { 
  IconLock, 
  IconUser, 
  IconAlertCircle,
  IconMail,
  IconUserPlus,
  IconUsers,
  IconShield,
  IconBuildingHospital
} from '@tabler/icons-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();
  
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (!value ? 'Username is required' : value.length < 3 ? 'Username must be at least 3 characters' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        return /^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email';
      },
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (value, values) => 
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await register(values.username, values.email, values.password);
      notifications.show({
        title: 'Success',
        message: 'Account created successfully! Please log in.',
        color: 'green',
      });
      navigate('/login');
    } catch (err) {
      // Error is handled by the Auth context
      console.log('Registration error in component:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py={40}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 30, md: 50 }}
        justify="space-between"
        align="center"
      >
        {/* Left side - Features and image */}
        <Box w={{ base: '100%', md: '50%' }} ta="center" order={{ base: 2, md: 1 }}>
          <Box>
            <Title order={2} mb={30} color="blue.7">
              Join Healthics Today
            </Title>
            <Text mb={30} size="lg">
              Create your account to start managing your health journey
            </Text>
            
            <Image 
              src="/images/register-illustration.png" 
              radius="md"
              mb={30}
              style={{ maxWidth: 400, margin: '0 auto' }}
            />

            <Stack>
              <Group align="flex-start" noWrap>
                <ThemeIcon 
                  size={50} 
                  radius="md" 
                  variant="light" 
                  color="teal"
                >
                  <IconUsers size={26} />
                </ThemeIcon>
                <div>
                  <Text fw={700}>Join Our Community</Text>
                  <Text size="sm" c="dimmed">
                    Join thousands of patients who trust Healthics with their medical information.
                  </Text>
                </div>
              </Group>
              
              <Group align="flex-start" noWrap>
                <ThemeIcon 
                  size={50} 
                  radius="md" 
                  variant="light" 
                  color="blue"
                >
                  <IconShield size={26} />
                </ThemeIcon>
                <div>
                  <Text fw={700}>Security & Privacy</Text>
                  <Text size="sm" c="dimmed">
                    Your data is protected with industry-standard encryption and security protocols.
                  </Text>
                </div>
              </Group>
              
              <Group align="flex-start" noWrap>
                <ThemeIcon 
                  size={50} 
                  radius="md" 
                  variant="light" 
                  color="indigo"
                >
                  <IconBuildingHospital size={26} />
                </ThemeIcon>
                <div>
                  <Text fw={700}>Healthcare Network</Text>
                  <Text size="sm" c="dimmed">
                    Connect with healthcare providers who use our platform for seamless care.
                  </Text>
                </div>
              </Group>
            </Stack>
          </Box>
        </Box>

        {/* Right side - Registration form */}
        <Box w={{ base: '100%', md: '45%' }} order={{ base: 1, md: 2 }}>
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
              <IconUserPlus size={30} />
            </ThemeIcon>
            
            <Title ta="center" mt={30} order={2}>
              Create Account
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
              Create your account to manage your health data
            </Text>

            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                color="red" 
                withCloseButton 
                onClose={clearError}
                mb="lg"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  required
                  label="Username"
                  placeholder="Choose a username"
                  icon={<IconUser size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('username')}
                />

                <TextInput
                  required
                  label="Email"
                  placeholder="your@email.com"
                  icon={<IconMail size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  required
                  label="Password"
                  placeholder="Choose a password"
                  icon={<IconLock size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('password')}
                />

                <PasswordInput
                  required
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  icon={<IconLock size={16} />}
                  radius="md"
                  size="md"
                  {...form.getInputProps('confirmPassword')}
                />

                <Button 
                  type="submit" 
                  loading={loading} 
                  radius="xl" 
                  size="md" 
                  mt="xl" 
                  fullWidth
                >
                  Register
                </Button>
              </Stack>
            </form>

            <Divider label="Already have an account?" labelPosition="center" my="lg" />

            <Button 
              component={Link} 
              to="/login"
              variant="outline"
              radius="xl"
              size="md"
              fullWidth
            >
              Sign In
            </Button>
          </Paper>
        </Box>
      </Flex>
    </Container>
  );
};

export default RegisterPage;