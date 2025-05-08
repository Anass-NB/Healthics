import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Stack, Anchor, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';

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

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Welcome to Healthics
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Your secure medical document management system
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert color="red" onClose={clearError}>
                {error}
              </Alert>
            )}

            <TextInput
              required
              label="Username"
              placeholder="Your username"
              {...form.getInputProps('username')}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />

            <Button fullWidth mt="xl" type="submit" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor component={Link} to="/register">
            Register
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default LoginPage;