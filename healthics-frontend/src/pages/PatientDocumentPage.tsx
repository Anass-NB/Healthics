import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Button, Group, Table, Badge, ActionIcon, Text, Menu, Alert, Paper, LoadingOverlay } from '@mantine/core';
import documentService, { Document, DocumentCategory } from '../api/documentService';
import adminService from '../api/adminService';
import { notifications } from '@mantine/notifications';

const PatientDocumentsPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<{ name: string; username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories 
        const catsData = await documentService.getCategories();
        setCategories(catsData);
        
        try {
          // Get patient info
          const patients = await adminService.getAllPatients();
          const patient = patients.find(p => p.id === parseInt(patientId));
          
          if (patient) {
            setPatientInfo({
              name: `${patient.firstName} ${patient.lastName}`,
              username: patient.user.username,
              email: patient.user.email
            });
            
            // Fetch documents for this patient using the admin API
            try {
              const patientDocuments = await adminService.getPatientDocuments(parseInt(patientId));
              setDocuments(patientDocuments);
            } catch (docError) {
              console.error('Error fetching patient documents:', docError);
              setError('Could not load patient documents. The API endpoint may not be implemented yet.');
            }
          } else {
            setError(`Patient with ID ${patientId} not found`);
          }
        } catch (patientError) {
          console.error('Could not fetch patient details:', patientError);
          setError('Failed to load patient information');
        }
      } catch (error: any) {
        console.error('Error in PatientDocumentsPage:', error);
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
      const document = documents.find(doc => doc.id === id);
      if (!document) return;

      // Use admin service to download the document
      const blob = await adminService.downloadDocument(id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename || `document-${id}.pdf`;
      
      // Append to body, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notifications.show({
        title: 'Success',
        message: 'Document download started',
        color: 'green',
      });
    } catch (error) {
      console.error('Download error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to download document. Please try again.',
        color: 'red',
      });
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <Container size="lg" pos="relative">
      {loading && <LoadingOverlay visible />}
      
      <Group justify="space-between" mb="lg">
        <div>
          <Title>Documents for Patient</Title>
          {patientInfo && (
            <Text c="dimmed" mt="xs">
              {patientInfo.name} ({patientInfo.username}) - {patientInfo.email}
            </Text>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper shadow="xs" p="md" withBorder>
        {documents.length === 0 ? (
          <Text>No documents found for this patient.</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Hospital</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>{doc.title}</Table.Td>
                  <Table.Td>
                    <Badge>{getCategoryName(doc.categoryId)}</Badge>
                  </Table.Td>
                  <Table.Td>{doc.doctorName}</Table.Td>
                  <Table.Td>{doc.hospitalName}</Table.Td>
                  <Table.Td>
                    {new Date(doc.documentDate).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <Button size="xs" onClick={() => handleViewDocument(doc.id)}>
                        View
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => handleDownloadDocument(doc.id)}>
                        Download
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default PatientDocumentsPage;