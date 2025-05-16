import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Table, 
  Badge, 
  Text, 
  Alert, 
  Paper, 
  LoadingOverlay,
  Card,
  Stack,
  ActionIcon,
  Menu,
  Grid,
  Divider
} from '@mantine/core';
import { IconDownload, IconEye, IconDotsVertical, IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Import updated services that handle authentication properly
import adminService from '../api/adminService';
import documentService from '../api/documentService';

// Define Document interface to match API response exactly
interface Document {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  fileType: string;
  fileSize: number;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
  uploadDate: string;
  lastModifiedDate: string;
  downloadUrl: string;
}

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
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Skip fetching patient details and directly fetch documents
        // The patientId in the URL should match the user_id in the database
        try {
          // Directly fetch documents for this patient using the admin API
          // This avoids the need to find the patient first
          const patientDocuments = await adminService.getPatientDocuments(parseInt(patientId));
          console.log('Fetched patient documents:', patientDocuments);
          setDocuments(patientDocuments);
          
          // If we have documents, we can get patient info from the first document
          if (patientDocuments.length > 0 && patientDocuments[0].userId) {
            // Try to fetch patient details separately (optional)
            try {
              const patients = await adminService.getAllPatients();
              const patientData = patients.find(p => 
                // Try matching with user.id first, as that's likely what the URL ID represents
                p.user.id === parseInt(patientId) || 
                // Or try with patient profile id as fallback
                p.id === parseInt(patientId)
              );
              
              if (patientData) {
                setPatient(patientData);
              } else {
                console.log(`Could not find patient record for ID ${patientId}, but documents were found`);
                // Create a minimal patient object with what we know
                setPatient({
                  id: parseInt(patientId),
                  user: {
                    id: parseInt(patientId),
                    username: patientDocuments[0].username || 'Unknown',
                    email: '',
                    roles: [],
                    active: true
                  },
                  firstName: '',
                  lastName: '',
                  dateOfBirth: '',
                  phoneNumber: '',
                  address: '',
                  medicalHistory: '',
                  allergies: '',
                  medications: '',
                  emergencyContact: ''
                });
              }
            } catch (patientError) {
              console.error('Error fetching patient details:', patientError);
              // Continue with documents display even if patient details failed
            }
          } else if (patientDocuments.length === 0) {
            // No documents found, but don't show error
            console.log(`No documents found for patient ID ${patientId}`);
            
            // Try to get patient info anyway
            try {
              const patients = await adminService.getAllPatients();
              const patientData = patients.find(p => 
                p.user.id === parseInt(patientId) || 
                p.id === parseInt(patientId)
              );
              
              if (patientData) {
                setPatient(patientData);
              } else {
                setError(`Patient with ID ${patientId} not found`);
              }
            } catch (patientError) {
              console.error('Error fetching patient details:', patientError);
              setError(`Patient with ID ${patientId} not found`);
            }
          }
        } catch (docError) {
          console.error('Error fetching patient documents:', docError);
          setError('Could not load patient documents. ' + (docError.response?.data?.message || ''));
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
      // Use updated service method that preserves authentication
      await adminService.downloadDocument(id);
      
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
    return (
      <Container size="lg" pos="relative">
        <LoadingOverlay visible={true} />
        <Title mb="lg">Patient Documents</Title>
        <Text>Loading patient documents...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" pos="relative">
      <Group mb="lg">
        <ActionIcon size="lg" variant="subtle" onClick={() => navigate('/admin/dashboard')}>
          <IconArrowLeft />
        </ActionIcon>
        <div>
          <Title>Patient Documents</Title>
          {patient && (
            <Text c="dimmed" size="sm">
              {patient.firstName} {patient.lastName} ({patient.user.username}) - {patient.user.email}
            </Text>
          )}
        </div>
      </Group>

      {error && (
        <Alert color="red" mb="lg" title="Error" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {patient && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack spacing="xs">
                <Text fw={500}>Personal Information</Text>
                <Divider />
                <Group>
                  <Text fw={500} size="sm">Name:</Text>
                  <Text>{patient.firstName} {patient.lastName}</Text>
                </Group>
                <Group>
                  <Text fw={500} size="sm">Date of Birth:</Text>
                  <Text>{formatDate(patient.dateOfBirth)}</Text>
                </Group>
                <Group>
                  <Text fw={500} size="sm">Phone:</Text>
                  <Text>{patient.phoneNumber}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack spacing="xs">
                <Text fw={500}>Medical Information</Text>
                <Divider />
                <Group align="flex-start">
                  <Text fw={500} size="sm">Allergies:</Text>
                  <Text>{patient.allergies || 'None'}</Text>
                </Group>
                <Group align="flex-start">
                  <Text fw={500} size="sm">Medications:</Text>
                  <Text>{patient.medications || 'None'}</Text>
                </Group>
                <Badge 
                  size="lg"
                  color={patient.user.active ? 'green' : 'red'}
                >
                  {patient.user.active ? 'Active' : 'Inactive'}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      {documents.length === 0 ? (
        <Paper shadow="sm" p="md" withBorder>
          <Text>No documents found for this patient.</Text>
        </Paper>
      ) : (
        <Paper shadow="sm" p="md" withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Hospital</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>{doc.title}</Table.Td>
                  <Table.Td>
                    <Badge>{doc.categoryName}</Badge>
                  </Table.Td>
                  <Table.Td>{doc.doctorName}</Table.Td>
                  <Table.Td>{doc.hospitalName}</Table.Td>
                  <Table.Td>{formatDate(doc.documentDate)}</Table.Td>
                  <Table.Td>{formatFileSize(doc.fileSize)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue" 
                        onClick={() => handleViewDocument(doc.id)}
                        title="View document"
                      >
                        <IconEye size="1.125rem" />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="green" 
                        onClick={() => handleDownloadDocument(doc.id)}
                        title="Download document"
                        loading={downloadingId === doc.id}
                      >
                        <IconDownload size="1.125rem" />
                      </ActionIcon>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDotsVertical size="1.125rem" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => handleViewDocument(doc.id)}>
                            View Details
                          </Menu.Item>
                          <Menu.Item onClick={() => handleDownloadDocument(doc.id)}>
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