import { useState, useEffect } from 'react';
import { Container, Title, Paper, Grid, TextInput, Button, Textarea, Stack, Alert } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import patientService, { PatientProfile } from '../api/patientService';
import { notifications } from '@mantine/notifications';

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
    <Container size="md">
      <Title mb="lg">My Profile</Title>
      
      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper shadow="xs" p="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  required
                  label="First Name"
                  placeholder="Enter your first name"
                  {...form.getInputProps('firstName')}
                  disabled={loading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  required
                  label="Last Name"
                  placeholder="Enter your last name"
                  {...form.getInputProps('lastName')}
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DateInput
                  required
                  label="Date of Birth"
                  placeholder="Select your date of birth"
                  value={form.values.dateOfBirth ? new Date(form.values.dateOfBirth) : null}
                  onChange={handleDateChange}
                  error={form.errors.dateOfBirth}
                  disabled={loading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  required
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  {...form.getInputProps('phoneNumber')}
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Address"
              placeholder="Enter your address"
              {...form.getInputProps('address')}
              disabled={loading}
            />

            <Textarea
              label="Medical History"
              placeholder="Enter your medical history"
              minRows={3}
              {...form.getInputProps('medicalHistory')}
              disabled={loading}
            />

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Textarea
                  label="Allergies"
                  placeholder="List your allergies"
                  minRows={2}
                  {...form.getInputProps('allergies')}
                  disabled={loading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Textarea
                  label="Medications"
                  placeholder="List your current medications"
                  minRows={2}
                  {...form.getInputProps('medications')}
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Emergency Contact"
              placeholder="Name and phone number"
              {...form.getInputProps('emergencyContact')}
              disabled={loading}
            />

            <Button type="submit" loading={submitting} disabled={loading}>
              {profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;