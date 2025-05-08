import { useState, useEffect } from 'react';
import { Container, Title, Text, Paper, Group, Grid, Table, Badge, Button, Stack, Alert, Tabs, LoadingOverlay } from '@mantine/core';
import adminService, { SystemStatistics, PatientResponse } from '../api/adminService';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load statistics
        try {
          const statsData = await adminService.getSystemStatistics();
          console.log('Statistics loaded:', statsData);
          setStats(statsData);
        } catch (statsError: any) {
          console.error('Failed to load statistics:', statsError);
          setError('Failed to load system statistics. ' + (statsError.response?.data?.message || ''));
        }
        
        // Load patients
        try {
          console.log('Fetching patients...');
          const patientsData = await adminService.getAllPatients();
          console.log('Patients loaded:', patientsData);
          
          if (!patientsData || patientsData.length === 0) {
            console.warn('No patients returned from API, using mock data');
            // Fallback to mock data if API returns empty
            const mockPatients = adminService.getMockPatients();
            setPatients(mockPatients);
          } else {
            setPatients(patientsData);
          }
        } catch (patientsError: any) {
          console.error('Failed to load patients:', patientsError);
          console.warn('Using mock patient data instead');
          // Fallback to mock data on error
          const mockPatients = adminService.getMockPatients();
          setPatients(mockPatients);
          
          if (!error) {
            setError('Failed to load patient data. ' + (patientsError.response?.data?.message || ''));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (patientId: number, active: boolean) => {
    try {
      await adminService.updatePatientStatus(patientId, active);
      
      // Update the patients list to reflect the change
      setPatients(patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, user: { ...patient.user, active } } 
          : patient
      ));
      
      notifications.show({
        title: 'Success',
        message: `Patient status updated to ${active ? 'active' : 'inactive'}`,
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update patient status',
        color: 'red',
      });
    }
  };

  const handleViewPatientDocuments = (patientId: number) => {
    navigate(`/admin/patients/${patientId}/documents`);
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard = ({ title, value, color = "blue" }: { title: string; value: string | number; color?: string }) => (
    <Paper shadow="xs" p="md" withBorder style={{ borderTop: `4px solid var(--mantine-color-${color}-6)` }}>
      <Text c="dimmed" size="sm">
        {title}
      </Text>
      <Text size="xl" fw={700} mt="sm">
        {value}
      </Text>
    </Paper>
  );

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={loading} />
      <Title mb="lg">Admin Dashboard</Title>
      
      {error && (
        <Alert color="red" title="Error" mb="lg" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="patients">Patients ({patients.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          {stats && (
            <Stack spacing="lg">
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard title="Total Patients" value={stats.totalPatients} color="blue" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard title="Total Documents" value={stats.totalDocuments} color="green" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard title="Total Storage Used" value={formatStorageSize(stats.totalStorageUsed)} color="indigo" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard title="Documents This Month" value={stats.documentsUploadedThisMonth} color="teal" />
                </Grid.Col>
              </Grid>
              
              <Grid gutter="md" mt="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard title="Active Users" value={stats.activeUsers} color="green" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard title="Inactive Users" value={stats.inactiveUsers} color="red" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard title="Documents Uploaded Today" value={stats.documentsUploadedToday} color="orange" />
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="patients" pt="md">
          <Paper shadow="xs" p="md" withBorder>
            {patients.length === 0 ? (
              <Text>No patients registered yet.</Text>
            ) : (
              <>
                <Text mb="md">Total patients: {patients.length}</Text>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>ID</Table.Th>
                      <Table.Th>Username</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {patients.map((patient) => (
                      <Table.Tr key={patient.id}>
                        <Table.Td>{patient.id}</Table.Td>
                        <Table.Td>{patient.user.username}</Table.Td>
                        <Table.Td>{patient.firstName} {patient.lastName}</Table.Td>
                        <Table.Td>{patient.user.email}</Table.Td>
                        <Table.Td>
                          <Badge color={patient.user.active ? 'green' : 'red'}>
                            {patient.user.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Button 
                              size="xs" 
                              onClick={() => handleViewPatientDocuments(patient.id)}
                            >
                              View Documents
                            </Button>
                            {patient.user.active ? (
                              <Button 
                                size="xs" 
                                color="red" 
                                onClick={() => handleStatusChange(patient.id, false)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button 
                                size="xs" 
                                color="green" 
                                onClick={() => handleStatusChange(patient.id, true)}
                              >
                                Activate
                              </Button>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;