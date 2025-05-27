import { useState, useEffect } from 'react';
import { Container, Paper, Grid, TextInput, Button, Textarea, Stack, Alert, LoadingOverlay, ThemeIcon, Card, Group, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconUser, IconPhone, IconMapPin, IconHeart, IconUsers } from '@tabler/icons-react';
import patientService, { PatientProfile } from '../api/patientService';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  const form = useForm<PatientProfile>({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
      address: '',
      medicalHistory: '',
      allergies: '',
      medications: '',
      emergencyContact: '',
    },
    validate: {
      firstName: (value) => (!value ? 'First name is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
      dateOfBirth: (value) => (!value ? 'Date of birth is required' : null),
      phoneNumber: (value) => (!value ? 'Phone number is required' : null),
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await patientService.getProfile();
        setProfile(data);
        form.setValues({
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          phoneNumber: data.phoneNumber,
          address: data.address,
          medicalHistory: data.medicalHistory,
          allergies: data.allergies,
          medications: data.medications,
          emergencyContact: data.emergencyContact,
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile doesn't exist yet, which is fine
          setProfile(null);
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      form.setFieldValue('dateOfBirth', date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (profile) {
        await patientService.updateProfile(values);
        notifications.show({
          title: 'Success',
          message: 'Profile updated successfully',
          color: 'green',
        });
      } else {
        await patientService.createProfile(values);
        notifications.show({
          title: 'Success',
          message: 'Profile created successfully',
          color: 'green',
        });
      }
      
      // Refresh the profile data
      const updatedProfile = await patientService.getProfile();
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Container size="md" py="xl">
      <LoadingOverlay visible={loading} />
      
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal health information"
      />
      
      {error && (
        <Alert 
          color="red" 
          mb="xl" 
          withCloseButton 
          onClose={() => setError(null)}
          radius="md"
        >
          {error}
        </Alert>
      )}
      
      <Paper 
        shadow="sm" 
        p="xl" 
        radius="xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* Personal Information Section */}
            <Card 
              p="lg" 
              radius="lg"
              style={{
                background: 'rgba(20, 184, 166, 0.05)',
                border: '1px solid rgba(20, 184, 166, 0.1)'
              }}
            >              <Group mb="md" gap="sm">
                <ThemeIcon size="lg" radius="xl" color="medicalBlue" variant="light">
                  <IconUser size={20} />
                </ThemeIcon>
                <Text fw={600} size="lg" c="medicalBlue">Personal Information</Text>
              </Group>
              
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    required
                    label="First Name"
                    placeholder="Enter your first name"
                    leftSection={<IconUser size={16} />}
                    radius="md"
                    size="md"
                    {...form.getInputProps('firstName')}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    required
                    label="Last Name"
                    placeholder="Enter your last name"
                    leftSection={<IconUser size={16} />}
                    radius="md"
                    size="md"
                    {...form.getInputProps('lastName')}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
              </Grid>

              <Grid gutter="md" mt="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    required
                    label="Date of Birth"
                    placeholder="Select your date of birth"
                    radius="md"
                    size="md"
                    value={form.values.dateOfBirth ? new Date(form.values.dateOfBirth) : null}
                    onChange={handleDateChange}
                    error={form.errors.dateOfBirth}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    required
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    leftSection={<IconPhone size={16} />}
                    radius="md"
                    size="md"
                    {...form.getInputProps('phoneNumber')}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Address"
                placeholder="Enter your address"
                leftSection={<IconMapPin size={16} />}
                radius="md"
                size="md"
                mt="md"
                {...form.getInputProps('address')}
                disabled={loading || submitting}
              />
            </Card>

            {/* Medical Information Section */}
            <Card 
              p="lg" 
              radius="lg"
              style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}
            >
              <Group mb="md" gap="sm">
                <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                  <IconHeart size={20} />
                </ThemeIcon>
                <Text fw={600} size="lg" c="blue">Medical Information</Text>
              </Group>
              
              <Textarea
                label="Medical History"
                placeholder="Enter your medical history, previous conditions, surgeries, etc."
                minRows={3}
                radius="md"
                size="md"
                {...form.getInputProps('medicalHistory')}
                disabled={loading || submitting}
              />

              <Grid gutter="md" mt="md">                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Textarea
                    label="Allergies"
                    placeholder="List your known allergies"
                    minRows={2}
                    radius="md"
                    size="md"
                    {...form.getInputProps('allergies')}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Textarea
                    label="Current Medications"
                    placeholder="List your current medications and dosages"
                    minRows={2}
                    radius="md"
                    size="md"
                    {...form.getInputProps('medications')}
                    disabled={loading || submitting}
                  />
                </Grid.Col>
              </Grid>
            </Card>

            {/* Emergency Contact Section */}
            <Card 
              p="lg" 
              radius="lg"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}
            >
              <Group mb="md" gap="sm">
                <ThemeIcon size="lg" radius="xl" color="red" variant="light">
                  <IconUsers size={20} />
                </ThemeIcon>
                <Text fw={600} size="lg" c="red">Emergency Contact</Text>
              </Group>
              
              <TextInput
                label="Emergency Contact"
                placeholder="Name and phone number of emergency contact"
                leftSection={<IconUsers size={16} />}
                radius="md"
                size="md"
                {...form.getInputProps('emergencyContact')}
                disabled={loading || submitting}
              />
            </Card>

            <Button 
              type="submit" 
              loading={submitting} 
              disabled={loading}
              size="md"
              radius="xl"              variant="gradient"
              gradient={{ from: 'medicalBlue', to: 'blue' }}
              fullWidth
            >
              {profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;