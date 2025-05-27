import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  Badge,
  Group,
  Text,
  TextInput,
  Select,
  Pagination,
  LoadingOverlay,
  Alert,
  ActionIcon,
  Tooltip,
  Stack
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import adminService from '../api/adminService';
import { IconSearch, IconEye, IconDownload, IconFolder, IconDashboard } from '@tabler/icons-react';
import { Document } from '../api/documentService';
import PageHeader from '../components/PageHeader';

interface ExtendedDocument extends Document {
  userId: number;
  username: string;
}

const AdminAllDocumentsPage = () => {
  const [documents, setDocuments] = useState<ExtendedDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<ExtendedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>('all');
  const [patientFilter, setPatientFilter] = useState<string | null>('all');
  const [activePage, setActivePage] = useState(1);
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all documents through admin API
      const response = await adminService.getAllDocuments();
      console.log('Documents loaded:', response);
      
      setDocuments(response);
      applyFilters(response, searchTerm, categoryFilter, patientFilter);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents: ' + (error.response?.data?.message || error.message));
      
      // If API call fails, use empty array
      setDocuments([]);
      setFilteredDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: ExtendedDocument[], 
    search: string, 
    category: string | null,
    patient: string | null
  ) => {
    let result = [...data];
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        doc => 
          doc.title.toLowerCase().includes(lowerSearch) ||
          (doc.description && doc.description.toLowerCase().includes(lowerSearch)) ||
          (doc.doctorName && doc.doctorName.toLowerCase().includes(lowerSearch)) ||
          (doc.hospitalName && doc.hospitalName.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply category filter
    if (category && category !== 'all') {
      result = result.filter(doc => doc.categoryId?.toString() === category);
    }
    
    // Apply patient filter
    if (patient && patient !== 'all') {
      result = result.filter(doc => doc.userId.toString() === patient);
    }
    
    setFilteredDocs(result);
    setActivePage(1); // Reset pagination when filters change
  };

  useEffect(() => {
    applyFilters(documents, searchTerm, categoryFilter, patientFilter);
  }, [searchTerm, categoryFilter, patientFilter]);

  const handleViewDocument = (documentId: number) => {
    navigate(`/admin/documents/${documentId}`);
  };
  
  const handleDownloadDocument = async (documentId: number) => {
    try {
      await adminService.downloadDocument(documentId);
      notifications.show({
        title: 'Success',
        message: 'Document download started',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to download document',
        color: 'red',
      });
    }
  };

  const handleViewPatientDocuments = (patientId: number) => {
    navigate(`/admin/patients/${patientId}/documents`);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get unique categories and patients for filters
  const categories = [
    { value: 'all', label: 'All Categories' }, 
    ...Array.from(new Set(documents.map(doc => doc.categoryId)))
      .filter(id => id !== null && id !== undefined)
      .map(id => {
        const category = documents.find(doc => doc.categoryId === id);
        return { 
          value: id!.toString(), 
          label: category?.categoryName || `Category ${id}` 
        };
      })
  ];
  
  const patients = [
    { value: 'all', label: 'All Patients' }, 
    ...Array.from(new Set(documents.map(doc => doc.userId)))
      .map(id => {
        const doc = documents.find(doc => doc.userId === id);
        return { 
          value: id.toString(), 
          label: doc?.username || `Patient ${id}` 
        };
      })
  ];
  
  const paginatedDocuments = filteredDocs.slice(
    (activePage - 1) * ITEMS_PER_PAGE, 
    activePage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  return (
    <Container size="lg" pos="relative" py="xl">
      <LoadingOverlay visible={loading} />
      
      <PageHeader
        title="All Patient Documents"
        subtitle="Browse and manage all documents in the system"
        action={
          <Group gap="sm">
            <ActionIcon 
              variant="light" 
              color="blue"
              size="lg"
              radius="xl"
              onClick={() => navigate('/admin/dashboard')}
            >
              <IconDashboard size={20} />
            </ActionIcon>
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
      
      <Paper 
        shadow="sm" 
        p="xl" 
        radius="xl" 
        mb="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="flex-end">
            <Group gap="md">
              <TextInput
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                w={250}
                radius="md"
                size="sm"
              />
              
              <Select
                placeholder="Filter by category"
                data={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
                w={180}
                radius="md"
                size="sm"
              />
              
              <Select
                placeholder="Filter by patient"
                data={patients}
                value={patientFilter}
                onChange={setPatientFilter}
                w={180}
                radius="md"
                size="sm"
              />
            </Group>
          </Group>        
        <Text size="sm" c="dimmed" mb="md">
          Showing {paginatedDocuments.length} of {filteredDocs.length} documents
        </Text>
        
        <Table 
          striped 
          highlightOnHover 
          withTableBorder 
          withColumnBorders
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            overflow: 'hidden'
          }}
        >
          <Table.Thead 
            style={{
              background: 'rgba(20, 184, 166, 0.1)'
            }}
          >
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Patient</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Uploaded</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>            {paginatedDocuments.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center">No documents found matching the criteria</Table.Td>
              </Table.Tr>
            ) : (
              paginatedDocuments.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>{doc.id}</Table.Td>
                  <Table.Td>{doc.title}</Table.Td>
                  <Table.Td>
                    <Badge 
                      color="blue" 
                      variant="light"
                      radius="md"
                      size="sm"
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleViewPatientDocuments(doc.userId)}
                    >
                      {doc.username}
                    </Badge>
                  </Table.Td>                  <Table.Td>
                    <Badge 
                      color="medicalBlue" 
                      variant="light"
                      radius="md"
                      size="sm"
                    >
                      {doc.categoryName || 'Uncategorized'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatFileSize(doc.fileSize)}</Table.Td>
                  <Table.Td>{formatDate(doc.uploadDate)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View Document">
                        <ActionIcon 
                          variant="light" 
                          color="blue"
                          onClick={() => handleViewDocument(doc.id)}
                          radius="md"
                          size="sm"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                        <Tooltip label="Download">
                        <ActionIcon 
                          variant="light" 
                          color="medicalBlue"
                          onClick={() => handleDownloadDocument(doc.id)}
                          radius="md"
                          size="sm"
                        >
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Tooltip>
                      
                      <Tooltip label="View Patient Documents">
                        <ActionIcon 
                          variant="light" 
                          color="violet"
                          onClick={() => handleViewPatientDocuments(doc.userId)}
                          radius="md"
                          size="sm"
                        >
                          <IconFolder size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>          {totalPages > 1 && (
          <Group justify="center" mt="lg">
            <Pagination 
              value={activePage} 
              onChange={setActivePage} 
              total={totalPages}
              color="medicalBlue"
              radius="md"
              size="sm"
            />
          </Group>
        )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminAllDocumentsPage;