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
  ActionIcon,
  Tooltip,
  Flex,
  Box
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import adminService from '../api/adminService';
import { IconSearch, IconEye, IconTrash, IconDownload, IconFolder } from '@tabler/icons-react';
import { Document } from '../api/documentService';

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
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={loading} />
      <Title mb="md">All Patient Documents</Title>
      
      {error && (
        <Alert color="red" title="Error" mb="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper shadow="xs" p="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              style={{ width: 250 }}
            />
            
            <Select
              placeholder="Filter by category"
              data={categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 180 }}
            />
            
            <Select
              placeholder="Filter by patient"
              data={patients}
              value={patientFilter}
              onChange={setPatientFilter}
              style={{ width: 180 }}
            />
          </Group>
        </Group>
        
        <Text size="sm" mb="md">
          Showing {paginatedDocuments.length} of {filteredDocs.length} documents
        </Text>
        
        <Table striped highlightOnHover>
          <Table.Thead>
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
          <Table.Tbody>
            {paginatedDocuments.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">No documents found matching the criteria</Table.Td>
              </Table.Tr>
            ) : (
              paginatedDocuments.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>{doc.id}</Table.Td>
                  <Table.Td>{doc.title}</Table.Td>
                  <Table.Td>
                    <Badge color="blue" style={{ cursor: 'pointer' }} onClick={() => handleViewPatientDocuments(doc.userId)}>
                      {doc.username}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="cyan">
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
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                      
                      <Tooltip label="Download">
                        <ActionIcon 
                          variant="light" 
                          color="green"
                          onClick={() => handleDownloadDocument(doc.id)}
                        >
                          <IconDownload size={18} />
                        </ActionIcon>
                      </Tooltip>
                      
                      <Tooltip label="View Patient Documents">
                        <ActionIcon 
                          variant="light" 
                          color="violet"
                          onClick={() => handleViewPatientDocuments(doc.userId)}
                        >
                          <IconFolder size={18} />
                        </ActionIcon>
                      </Tooltip>
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

export default AdminAllDocumentsPage;