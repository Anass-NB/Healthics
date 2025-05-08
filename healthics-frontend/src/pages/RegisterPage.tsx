import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Stack, Anchor, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      email: (value) => {
        // Fixed regex that was escaping backslashes
        if (!value) return 'Email is required';
        return /^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email';
      },
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (value, values) => 
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
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
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Create an Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Join Healthics to securely manage your medical documents
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
              placeholder="Choose a username"
              {...form.getInputProps('username')}
            />

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Choose a password"
              {...form.getInputProps('password')}
            />

            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm your password"
              {...form.getInputProps('confirmPassword')}
            />

            <Button fullWidth mt="xl" type="submit" loading={loading}>
              Register
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          Already have an account?{' '}
          <Anchor component={Link} to="/login">
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default RegisterPage;