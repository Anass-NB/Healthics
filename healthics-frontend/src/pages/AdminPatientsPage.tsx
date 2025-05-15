import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Table, 
  Badge, 
  Button, 
  Group, 
  Text, 
  TextInput, 
  Select, 
  Pagination, 
  LoadingOverlay, 
  Alert,
  Tabs,
  ActionIcon,
  Tooltip,
  Checkbox
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import adminService from '../api/adminService';
import { IconSearch, IconEye, IconUserOff, IconUserCheck, IconShield, IconShieldOff, IconFileText } from '@tabler/icons-react';

interface PatientData {
  id: number;
  username: string;
  email: string;
  active: boolean;
  banned: boolean;
  hasProfile: boolean;
  firstName?: string;
  lastName?: string;
  profileId?: number;
  documentCount: number;
}

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [profileFilter, setProfileFilter] = useState<string | null>('all');
  const [activePage, setActivePage] = useState(1);
  const [includeIncomplete, setIncludeIncomplete] = useState(true);
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchPatients();
  }, [includeIncomplete]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all patients, including those without profiles
      const endpoint = includeIncomplete ? '/admin/patients/all' : '/admin/patients/with-profiles';
      const response = await adminService.getPatients(endpoint);
      console.log('Patients loaded:', response);
      
      setPatients(response);
      applyFilters(response, searchTerm, statusFilter, profileFilter);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients: ' + (error.response?.data?.message || error.message));
      
      // If the API call fails, use mock data
      const mockData = adminService.getMockPatients();
      setPatients(mockData);
      applyFilters(mockData, searchTerm, statusFilter, profileFilter);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: PatientData[], 
    search: string, 
    status: string | null,
    profile: string | null
  ) => {
    let result = [...data];
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        patient => 
          patient.username.toLowerCase().includes(lowerSearch) ||
          patient.email.toLowerCase().includes(lowerSearch) ||
          (patient.firstName && patient.firstName.toLowerCase().includes(lowerSearch)) ||
          (patient.lastName && patient.lastName.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        result = result.filter(patient => patient.active && !patient.banned);
      } else if (status === 'inactive') {
        result = result.filter(patient => !patient.active && !patient.banned);
      } else if (status === 'banned') {
        result = result.filter(patient => patient.banned);
      }
    }
    
    // Apply profile filter
    if (profile && profile !== 'all') {
      if (profile === 'complete') {
        result = result.filter(patient => patient.hasProfile);
      } else if (profile === 'incomplete') {
        result = result.filter(patient => !patient.hasProfile);
      }
    }
    
    setFilteredPatients(result);
    setActivePage(1); // Reset pagination when filters change
  };

  useEffect(() => {
    applyFilters(patients, searchTerm, statusFilter, profileFilter);
  }, [searchTerm, statusFilter, profileFilter]);

  const handleStatusChange = async (patientId: number, active: boolean) => {
    try {
      await adminService.updatePatientStatus(patientId, active);
      
      // Update the patients list to reflect the change
      const updatedPatients = patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, active } 
          : patient
      );
      
      setPatients(updatedPatients);
      applyFilters(updatedPatients, searchTerm, statusFilter, profileFilter);
      
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
  
  const handleBanStatusChange = async (patientId: number, banned: boolean) => {
    try {
      await adminService.updatePatientBanStatus(patientId, banned);
      
      // Update the patients list to reflect the change
      const updatedPatients = patients.map(patient => 
        patient.id === patientId 
          ? { ...patient, banned, active: banned ? false : patient.active } 
          : patient
      );
      
      setPatients(updatedPatients);
      applyFilters(updatedPatients, searchTerm, statusFilter, profileFilter);
      
      notifications.show({
        title: 'Success',
        message: `Patient ${banned ? 'banned' : 'unbanned'} successfully`,
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update ban status',
        color: 'red',
      });
    }
  };

  const handleViewPatientDocuments = (patientId: number) => {
    navigate(`/admin/patients/${patientId}/documents`);
  };
  
  const paginatedPatients = filteredPatients.slice(
    (activePage - 1) * ITEMS_PER_PAGE, 
    activePage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={loading} />
      <Title mb="md">Patient Management</Title>
      
      {error && (
        <Alert color="red" title="Error" mb="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper shadow="xs" p="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              width={250}
            />
            
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
                { value: 'banned', label: 'Banned Only' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width={150}
            />
            
            <Select
              placeholder="Filter by profile"
              data={[
                { value: 'all', label: 'All Profiles' },
                { value: 'complete', label: 'Complete Profiles' },
                { value: 'incomplete', label: 'Incomplete Profiles' }
              ]}
              value={profileFilter}
              onChange={setProfileFilter}
              width={170}
            />
          </Group>
          
          <Checkbox
            label="Include patients without profiles"
            checked={includeIncomplete}
            onChange={(e) => setIncludeIncomplete(e.currentTarget.checked)}
          />
        </Group>
        
        <Text size="sm" mb="xs">
          Showing {Math.min(filteredPatients.length, ITEMS_PER_PAGE)} of {filteredPatients.length} patients
        </Text>
        
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Profile</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Docs</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedPatients.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={8} align="center">No patients found matching the criteria</Table.Td>
              </Table.Tr>
            ) : (
              paginatedPatients.map((patient) => (
                <Table.Tr key={patient.id}>
                  <Table.Td>{patient.id}</Table.Td>
                  <Table.Td>{patient.username}</Table.Td>
                  <Table.Td>
                    {patient.hasProfile ? `${patient.firstName} ${patient.lastName}` : 'Not provided'}
                  </Table.Td>
                  <Table.Td>{patient.email}</Table.Td>
                  <Table.Td>
                    <Badge color={patient.hasProfile ? 'green' : 'orange'}>
                      {patient.hasProfile ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {patient.banned ? (
                      <Badge color="red">Banned</Badge>
                    ) : (
                      <Badge color={patient.active ? 'green' : 'yellow'}>
                        {patient.active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td align="center">
                    <Badge color={patient.documentCount > 0 ? 'blue' : 'gray'}>
                      {patient.documentCount}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Documents">
                        <ActionIcon 
                          variant="light" 
                          color="blue"
                          onClick={() => handleViewPatientDocuments(patient.id)}
                        >
                          <IconFileText size={18} />
                        </ActionIcon>
                      </Tooltip>
                      
                      {!patient.banned && (
                        <>
                          {patient.active ? (
                            <Tooltip label="Deactivate">
                              <ActionIcon 
                                variant="light" 
                                color="yellow"
                                onClick={() => handleStatusChange(patient.id, false)}
                              >
                                <IconUserOff size={18} />
                              </ActionIcon>
                            </Tooltip>
                          ) : (
                            <Tooltip label="Activate">
                              <ActionIcon 
                                variant="light" 
                                color="green"
                                onClick={() => handleStatusChange(patient.id, true)}
                              >
                                <IconUserCheck size={18} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </>
                      )}
                      
                      {patient.banned ? (
                        <Tooltip label="Unban">
                          <ActionIcon 
                            variant="light" 
                            color="green"
                            onClick={() => handleBanStatusChange(patient.id, false)}
                          >
                            <IconShieldOff size={18} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Tooltip label="Ban">
                          <ActionIcon 
                            variant="light" 
                            color="red"
                            onClick={() => handleBanStatusChange(patient.id, true)}
                          >
                            <IconShield size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination 
              value={activePage} 
              onChange={setActivePage} 
              total={totalPages} 
            />
          </Group>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPatientsPage;