import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Group, 
  Table, 
  Badge, 
  Text, 
  Alert, 
  Paper, 
  Card,
  Stack,
  ActionIcon,
  Menu,
  Grid,
  Divider,
  ThemeIcon,
  TextInput
} from '@mantine/core';
import { IconDownload, IconEye, IconDotsVertical, IconAlertCircle, IconSearch, IconRefresh, IconFileOff, IconDashboard } from '@tabler/icons-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import PageLoading from '../components/PageLoading';
import { notifications } from '@mantine/notifications';

// Import updated services that handle authentication properly
import adminService from '../api/adminService';

// Define Document interface to match API response exactly
interface Document {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  fileType: string;
  fileSize: number;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
  uploadDate: string;
  lastModifiedDate: string;
  downloadUrl: string;
  userId: number;
  username: string;
}

// Interface for users without profiles
interface PatientUser {
  id: number;
  username: string;
  email: string;
  active: boolean;
  banned?: boolean;
  hasProfile: boolean;
  firstName?: string;
  lastName?: string;
  profileId?: number;
  documentCount?: number;
}

// Interface for users with complete profiles
interface Patient {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    roles: { id: number; name: string }[];
    active: boolean;
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
}

const AdminPatientDocumentsPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  // Filter documents when search query or documents change
  useEffect(() => {
    if (!documents.length) {
      setFilteredDocuments([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(normalizedQuery) ||
      (doc.description && doc.description.toLowerCase().includes(normalizedQuery)) ||
      (doc.doctorName && doc.doctorName.toLowerCase().includes(normalizedQuery)) ||
      (doc.hospitalName && doc.hospitalName.toLowerCase().includes(normalizedQuery)) ||
      (doc.categoryName && doc.categoryName.toLowerCase().includes(normalizedQuery))
    );
    
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  // Add a console log on component mount to track rendering
  useEffect(() => {
    console.log('AdminPatientDocumentsPage mounted');
    // Log available params
    console.log('Route params:', { patientId });
    
    return () => {
      console.log('AdminPatientDocumentsPage unmounted');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) {
        console.error('No patientId provided');
        setError('No patient ID provided');
        setLoading(false);
        return;
      }

      console.log('Fetching data for patient ID:', patientId);
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all patient users, including those without profiles
        try {
          const allPatients = await adminService.getPatients('/admin/patients/all');
          console.log('All patients (including those without profiles):', allPatients);
          
          // Find user by USERID (not profile ID)
          const userIdNum = parseInt(patientId);
          const patientUserData = allPatients.find((p: PatientUser) => p.id === userIdNum);
          
          if (patientUserData) {
            setPatientUser(patientUserData);
            
            // Check if user has a profile
            if (patientUserData.hasProfile) {
              // If they have a profile, try to get the full profile data
              try {
                const patientsWithProfiles = await adminService.getPatients('/admin/patients/with-profiles');
                const fullProfileData = patientsWithProfiles.find((p: Patient) => p.user.id === userIdNum);
                if (fullProfileData) {
                  setPatient(fullProfileData);
                } else {
                  console.warn('User has profile flag set to true but profile data not found');
                  setNoProfile(true);
                }
              } catch (profileError) {
                console.error('Could not fetch profile details:', profileError);
                setNoProfile(true);
              }
            } else {
              // User doesn't have a profile
              setNoProfile(true);
            }
            
            // Fetch documents using USER ID, not profile ID
            try {
              console.log(`Fetching documents for patient user ID: ${userIdNum}`);
              const patientDocuments = await adminService.getPatientDocuments(userIdNum);
              console.log('Patient documents fetched successfully:', patientDocuments);
              // Add missing fields if needed
              const documentsWithUserInfo = patientDocuments.map(doc => ({
                ...doc,
                userId: userIdNum,
                username: patientUserData.username
              }));
              setDocuments(documentsWithUserInfo);
            } catch (docError: any) {
              console.error('Error fetching patient documents:', docError);
              console.error('Error response:', docError.response?.data);
              setError(`Could not load patient documents: ${docError.response?.data?.message || docError.message || 'Unknown error'}`);
            }
          } else {
            setError(`User with ID ${patientId} not found`);
          }
        } catch (patientError) {
          console.error('Could not fetch patient users:', patientError);
          setError('Failed to load patient information');
        }
      } catch (error: any) {
        console.error('Error in AdminPatientDocumentsPage:', error);
        setError(error.response?.data?.message || 'Failed to load patient documents');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleViewDocument = (id: number) => {
    navigate(`/admin/documents/${id}`);
  };

  const handleDownloadDocument = async (id: number) => {
    try {
      setDownloadingId(id);
      // Use updated service method that now returns blob and filename
      const { blob, filename } = await adminService.downloadDocument(id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = filename || `document-${id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notifications.show({
        title: 'Success',
        message: 'Document download started',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to download document. Please try again.',
        color: 'red',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <PageLoading type="list" />;
  }

  // Log state before rendering
  console.log('AdminPatientDocumentsPage state before render:', {
    loading,
    error,
    patientId,
    documentsCount: documents.length,
    patientUserData: patientUser,
    patientProfileData: patient,
    noProfile
  });
  return (
    <Container size="lg" pos="relative">
      <PageHeader 
        title="Patient Documents"
        subtitle={patientUser ? 
          (patientUser.hasProfile && patientUser.firstName && patientUser.lastName 
            ? `${patientUser.firstName} ${patientUser.lastName} (${patientUser.username})` 
            : patientUser.username) + ` - ${patientUser.email}` 
          : undefined
        }        action={
          <ActionIcon 
            variant="light" 
            color="medicalBlue" 
            size="lg" 
            radius="md"
            onClick={() => navigate('/admin/dashboard')}
            title="Back to Dashboard"
          >
            <IconDashboard size={18} />
          </ActionIcon>
        }
      />

      {error && (
        <EmptyState
          title="Error Loading Documents"
          description={error}
          icon={
            <ThemeIcon size={80} radius={100} color="red.1" variant="light">
              <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
            </ThemeIcon>
          }
          primaryAction={{
            label: "Retry",
            onClick: () => window.location.reload(),
            icon: <IconRefresh size={16} />
          }}          secondaryAction={{
            label: "Dashboard",
            onClick: () => navigate('/admin/dashboard'),
            icon: <IconDashboard size={16} />
          }}
        />
      )}
      
      {noProfile && (
        <Alert color="yellow" mb="lg" title="Profile Missing" icon={<IconAlertCircle size="1rem" />}>
          This patient does not have a complete profile, but their documents are still accessible.
        </Alert>
      )}      {documents.length > 0 && (
        <Paper 
          style={{ 
            padding: '16px',
            marginBottom: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Group justify="space-between">
            <TextInput
              placeholder="Search documents..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: '100%', maxWidth: 400 }}
              size="sm"
              radius="md"
            />
            <Text size="sm" c="dimmed">
              Showing {filteredDocuments.length} of {documents.length} documents
            </Text>
          </Group>
        </Paper>
      )}      {patient && (
        <Card 
          withBorder 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          mb="lg"
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Text fw={500} size="lg" c="dark">Personal Information</Text>
                <Divider />
                <Group gap="xs">
                  <Text fw={500} size="sm" w={120}>Name:</Text>
                  <Text size="sm">{patient.firstName} {patient.lastName}</Text>
                </Group>
                <Group gap="xs">
                  <Text fw={500} size="sm" w={120}>Date of Birth:</Text>
                  <Text size="sm">{formatDate(patient.dateOfBirth)}</Text>
                </Group>
                <Group gap="xs">
                  <Text fw={500} size="sm" w={120}>Phone:</Text>
                  <Text size="sm">{patient.phoneNumber}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Text fw={500} size="lg" c="dark">Medical Information</Text>
                <Divider />
                <Group align="flex-start" gap="xs">
                  <Text fw={500} size="sm" w={120}>Allergies:</Text>
                  <Text size="sm">{patient.allergies || 'None'}</Text>
                </Group>
                <Group align="flex-start" gap="xs">
                  <Text fw={500} size="sm" w={120}>Medications:</Text>
                  <Text size="sm">{patient.medications || 'None'}</Text>
                </Group>                <Badge 
                  size="md"
                  color={patient.user.active ? 'medicalBlue' : 'red'}
                  variant="light"
                  radius="md"
                >
                  {patient.user.active ? 'Active' : 'Inactive'}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>
      )}      {!patient && patientUser && (
        <Card 
          withBorder 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          mb="lg"
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Stack gap="sm">
            <Text fw={500} size="lg" c="dark">User Information</Text>
            <Divider />
            <Group gap="xs">
              <Text fw={500} size="sm" w={120}>Username:</Text>
              <Text size="sm">{patientUser.username}</Text>
            </Group>
            <Group gap="xs">
              <Text fw={500} size="sm" w={120}>Email:</Text>
              <Text size="sm">{patientUser.email}</Text>
            </Group>
            <Group gap="xs">
              <Text fw={500} size="sm" w={120}>Status:</Text>
              <Group gap="xs">                <Badge 
                  size="md"
                  color={patientUser.active ? 'medicalBlue' : 'red'}
                  variant="light"
                  radius="md"
                >
                  {patientUser.active ? 'Active' : 'Inactive'}
                </Badge>
                {patientUser.banned && (
                  <Badge size="md" color="red" variant="light" radius="md">
                    Banned
                  </Badge>
                )}
              </Group>
            </Group>
          </Stack>
        </Card>
      )}

      {documents.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="This patient doesn't have any documents uploaded yet."
          icon={
            <ThemeIcon size={80} radius={100} color="blue.1" variant="light">
              <IconFileOff size={40} color="var(--mantine-color-blue-6)" />
            </ThemeIcon>
          }
          primaryAction={{
            label: "Refresh",
            onClick: () => window.location.reload(),
            icon: <IconRefresh size={16} />
          }}
        />
      ) : filteredDocuments.length === 0 && searchQuery.trim() !== '' ? (
        <EmptyState
          title="No Matching Documents"
          description={`No documents match your search for "${searchQuery}". Try a different search term.`}
          icon={
            <ThemeIcon size={80} radius={100} color="gray.1" variant="light">
              <IconSearch size={40} color="var(--mantine-color-gray-6)" />
            </ThemeIcon>
          }
          primaryAction={{
            label: "Clear Search",
            onClick: () => setSearchQuery(''),
            icon: <IconRefresh size={16} />
          }}
        />      ) : (
        <Paper 
          style={{ 
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Table 
            striped 
            highlightOnHover
            withRowBorders
            style={{
              '--table-border-color': 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <Table.Thead 
              style={{ 
                backgroundColor: 'rgba(0, 150, 136, 0.05)',
                borderBottom: '2px solid rgba(0, 150, 136, 0.2)'
              }}
            >
              <Table.Tr>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Title</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Category</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Doctor</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Hospital</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Date</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Size</Table.Th>
                <Table.Th style={{ fontWeight: 600, color: 'var(--mantine-color-dark-6)' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredDocuments.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">{doc.title}</Text>
                  </Table.Td>
                  <Table.Td>                    <Badge 
                      color="medicalBlue" 
                      variant="light"
                      radius="md"
                      size="sm"
                    >
                      {doc.categoryName || 'Uncategorized'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{doc.doctorName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{doc.hospitalName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(doc.documentDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{formatFileSize(doc.fileSize)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        onClick={() => handleViewDocument(doc.id)}
                        title="View document"
                        size="lg"
                        radius="md"
                      >
                        <IconEye size={16} />
                      </ActionIcon>                      <ActionIcon 
                        variant="light" 
                        color="medicalBlue" 
                        onClick={() => handleDownloadDocument(doc.id)}
                        title="Download document"
                        loading={downloadingId === doc.id}
                        size="lg"
                        radius="md"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="lg" radius="md">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEye size={14} />}
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconDownload size={14} />}
                            onClick={() => handleDownloadDocument(doc.id)}
                          >
                            Download
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default AdminPatientDocumentsPage;