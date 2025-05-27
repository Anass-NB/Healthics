import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  Paper, 
  Group, 
  Grid, 
  Button, 
  Stack, 
  Alert, 
  Tabs, 
  LoadingOverlay,
  Center,
  Box,
  RingProgress,
  Progress,
  SimpleGrid,
  ThemeIcon,
  Title
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import adminService, { SystemStatistics, ExtendedStatistics } from '../api/adminService';
import { 
  IconUsers, 
  IconFileText, 
  IconDatabase, 
  IconCalendar, 
  IconUserCheck, 
  IconUserOff,
  IconFileUpload,
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconFileAnalytics,
  IconUserBolt
} from '@tabler/icons-react';
import PageHeader from '../components/PageHeader';

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [extendedStats, setExtendedStats] = useState<ExtendedStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load basic statistics
        try {
          const statsData = await adminService.getSystemStatistics();
          console.log('Statistics loaded:', statsData);
          setStats(statsData);
        } catch (statsError: any) {
          console.error('Failed to load statistics:', statsError);
          setError('Failed to load system statistics. ' + (statsError.response?.data?.message || ''));
          // Use mock data on error
          setStats(adminService.getMockStatistics());
        }
        
        // Load extended statistics for charts
        try {
          const extendedStatsData = await adminService.getExtendedStatistics();
          console.log('Extended statistics loaded:', extendedStatsData);
          setExtendedStats(extendedStatsData);
        } catch (extStatsError: any) {
          console.error('Failed to load extended statistics:', extStatsError);
          // Use mock data on error
          setExtendedStats(adminService.getMockExtendedStatistics());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigateToPatientsPage = () => {
    navigate('/admin/patients');
  };
  
  const handleNavigateToDocumentsPage = () => {
    navigate('/admin/documents');
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const StatCard = ({ 
    title, 
    value, 
    color = "blue",
    icon: Icon 
  }: { 
    title: string; 
    value: string | number; 
    color?: string;
    icon: React.FC<any>;
  }) => (
    <Paper 
      shadow="sm" 
      p="xl" 
      radius="xl"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderLeft: `4px solid var(--mantine-color-${color}-6)`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      className="hover:transform hover:scale-105"
    >
      <Group gap="md" align="center">
        <ThemeIcon 
          size={50} 
          radius="xl" 
          color={color} 
          variant="light"
          style={{
            background: `rgba(var(--mantine-color-${color}-rgb), 0.1)`,
            border: `1px solid rgba(var(--mantine-color-${color}-rgb), 0.2)`
          }}
        >
          <Icon size={24} stroke={1.5} />
        </ThemeIcon>
        <div>
          <Text c="dimmed" size="sm" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt={4} c={color}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
  
  // For monthly data chart
  const MonthlyChart = ({ data }: { data: Record<string, number> }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <Paper shadow="xs" p="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>Monthly Document Uploads</Text>
          <IconChartBar size={18} />
        </Group>
        
        {Object.entries(data).map(([month, count]) => (
          <Box key={month} mb="sm">
            <Group justify="space-between" mb={5}>
              <Text size="xs">{month.charAt(0) + month.slice(1).toLowerCase()}</Text>
              <Text size="xs" fw={500}>{count}</Text>
            </Group>
            <Progress 
              value={(count / maxValue) * 100} 
              color="blue" 
              size="sm" 
            />
          </Box>
        ))}
      </Paper>
    );
  };
  
  // For document types pie chart
  const DocumentTypesChart = ({ data }: { data: Record<string, number> }) => {
    const total = Object.values(data).reduce((sum, current) => sum + current, 0);
    const items = Object.entries(data).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }));
      // Colors for the segments
    const colors = ['blue', 'medicalBlue', 'green', 'lime', 'yellow', 'orange', 'indigo'];
    
    return (
      <Paper shadow="xs" p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500}>Document Types</Text>
          <IconChartPie size={18} />
        </Group>
        
        <Center mb="md">
          <RingProgress
            size={150}
            thickness={20}
            roundCaps
            sections={
              items.map((item, index) => ({
                value: item.percentage,
                color: colors[index % colors.length],
                tooltip: `${item.type}: ${item.count} (${item.percentage}%)`
              }))
            }
            label={
              <Text ta="center" size="sm" fw={700}>
                {total} Total
              </Text>
            }
          />
        </Center>
        
        <Stack gap="xs">
          {items.map((item, index) => (
            <Group key={item.type} gap="xs">
              <Box w={12} h={12} bg={colors[index % colors.length]} style={{ borderRadius: '2px' }}></Box>
              <Text size="xs">{item.type}</Text>
              <Text size="xs" ml="auto" fw={500}>{item.count} ({item.percentage}%)</Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    );
  };
  
  // For user registration chart
  const RegistrationsChart = ({ data }: { data: Record<string, number> }) => {
    const maxValue = Math.max(...Object.values(data), 1);
    
    return (
      <Paper shadow="xs" p="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>Patient Registrations</Text>
          <IconChartLine size={18} />
        </Group>
        
        {Object.entries(data).map(([month, count]) => (
          <Box key={month} mb="sm">
            <Group justify="space-between" mb={5}>
              <Text size="xs">{month.charAt(0) + month.slice(1).toLowerCase()}</Text>
              <Text size="xs" fw={500}>{count}</Text>
            </Group>
            <Progress 
              value={(count / maxValue) * 100} 
              color="green" 
              size="sm" 
            />
          </Box>
        ))}
      </Paper>
    );
  };
  return (
    <Container size="lg" pos="relative" py="xl">
      <LoadingOverlay visible={loading} />
      
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage system statistics and user data"
        action={
          <Group gap="sm">
            <Button 
              variant="light" 
              color="blue"
              onClick={handleNavigateToPatientsPage}
              leftSection={<IconUsers size={18} />}
              radius="xl"
            >
              Manage Patients
            </Button>            <Button 
              variant="light" 
              color="medicalBlue"
              onClick={handleNavigateToDocumentsPage}
              leftSection={<IconFileText size={18} />}
              radius="xl"
            >
              All Documents
            </Button>
          </Group>
        }
      />
      
      {error && (
        <Alert 
          color="red" 
          title="Error" 
          mb="xl" 
          withCloseButton 
          onClose={() => setError(null)}
          radius="md"
        >
          {error}
        </Alert>
      )}
      
      <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
        <Tabs.List mb="xl">
          <Tabs.Tab value="overview" leftSection={<IconFileAnalytics size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="statistics" leftSection={<IconChartBar size={16} />}>
            Statistics & Charts
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          {stats && (
            <Stack gap="xl">
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients} 
                    color="blue" 
                    icon={IconUsers} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard 
                    title="Total Documents" 
                    value={stats.totalDocuments} 
                    color="green" 
                    icon={IconFileText} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatCard 
                    title="Total Storage Used" 
                    value={formatStorageSize(stats.totalStorageUsed)} 
                    color="indigo" 
                    icon={IconDatabase} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>                  <StatCard 
                    title="Documents This Month" 
                    value={stats.documentsUploadedThisMonth} 
                    color="medicalBlue" 
                    icon={IconCalendar} 
                  />
                </Grid.Col>
              </Grid>
              
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard 
                    title="Active Users" 
                    value={stats.activeUsers} 
                    color="green" 
                    icon={IconUserCheck} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard 
                    title="Inactive Users" 
                    value={stats.inactiveUsers} 
                    color="red" 
                    icon={IconUserOff} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <StatCard 
                    title="Documents Uploaded Today" 
                    value={stats.documentsUploadedToday} 
                    color="orange" 
                    icon={IconFileUpload} 
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="statistics" pt="md">
          {extendedStats && (
            <>
              <Paper shadow="xs" p="md" withBorder mb="lg">
                <Title order={3} mb="md">Users & Documents Statistics</Title>
                
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <StatCard 
                        title="Patients without Profiles" 
                        value={extendedStats.patientsWithoutProfiles} 
                        color="orange" 
                        icon={IconUserBolt} 
                      />
                      
                      <StatCard 
                        title="Banned Patients" 
                        value={extendedStats.bannedPatients} 
                        color="red" 
                        icon={IconUserOff} 
                      />
                    </SimpleGrid>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper shadow="xs" p="md" withBorder>
                      <Text size="sm" fw={500} mb="md">User Status Distribution</Text>
                      <Group mt={30} mb={15} grow justify="space-between">
                        <Box>
                          <RingProgress 
                            size={80}
                            thickness={8}
                            roundCaps
                            sections={[
                              { value: (extendedStats.activePatients / extendedStats.totalPatients) * 100, color: 'green' },
                              { value: (extendedStats.inactivePatients / extendedStats.totalPatients) * 100, color: 'yellow' },
                              { value: (extendedStats.bannedPatients / extendedStats.totalPatients) * 100, color: 'red' },
                            ]}
                            label={<Text ta="center" size="xs" fw={700}>Users</Text>}
                          />
                          <Text ta="center" size="xs" mt={5}>Active: {extendedStats.activePatients}</Text>
                        </Box>
                        
                        <Box>
                          <RingProgress 
                            size={80}
                            thickness={8}
                            roundCaps
                            sections={[
                              { value: ((extendedStats.totalPatients - extendedStats.patientsWithoutProfiles) / extendedStats.totalPatients) * 100, color: 'blue' },
                              { value: (extendedStats.patientsWithoutProfiles / extendedStats.totalPatients) * 100, color: 'orange' },
                            ]}
                            label={<Text ta="center" size="xs" fw={700}>Profiles</Text>}
                          />
                          <Text ta="center" size="xs" mt={5}>Complete: {extendedStats.totalPatients - extendedStats.patientsWithoutProfiles}</Text>
                        </Box>
                      </Group>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Paper>
              
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <MonthlyChart data={extendedStats.monthlyUploads} />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DocumentTypesChart data={extendedStats.documentTypes} />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <RegistrationsChart data={extendedStats.patientRegistrations} />
                </Grid.Col>
              </Grid>
            </>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;