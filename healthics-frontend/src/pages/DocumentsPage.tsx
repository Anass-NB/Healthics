import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Menu, 
  Text, 
  Alert, 
  LoadingOverlay, 
  Paper 
} from '@mantine/core';
import { IconDownload, IconEye, IconEdit, IconTrash, IconDotsVertical, IconPlus } from '@tabler/icons-react';
import documentService from '../api/documentService';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

// Define document interface to match API response exactly
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

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getAllDocuments();
        setDocuments(data);
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        setError(err.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleViewDocument = (id: number) => {
    navigate(`/documents/${id}`);
  };

  const handleEditDocument = (id: number) => {
    navigate(`/documents/${id}/edit`);
  };

  const handleDownloadDocument = async (id: number) => {
    try {
      setDownloadingId(id);
      // Use our updated service method that preserves authentication
      await documentService.downloadDocument(id);
      
      notifications.show({
        title: 'Success',
        message: 'Document download started',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to download document',
        color: 'red',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        notifications.show({
          title: 'Success',
          message: 'Document deleted successfully',
          color: 'green',
        });
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete document',
          color: 'red',
        });
      }
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

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={loading} />
      
      <Group justify="space-between" mb="lg">
        <Title>My Documents</Title>
        <Button 
          leftIcon={<IconPlus size="1rem" />} 
          onClick={() => navigate('/documents/upload')}
        >
          Upload Document
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="lg" title="Error" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper shadow="sm" p="md" withBorder>
        {documents.length === 0 ? (
          <Text>No documents found. Click the "Upload Document" button to add your first document.</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Doctor</Table.Th>
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
                      <ActionIcon 
                        variant="light" 
                        color="yellow" 
                        onClick={() => handleEditDocument(doc.id)}
                        title="Edit document"
                      >
                        <IconEdit size="1.125rem" />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red" 
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete document"
                      >
                        <IconTrash size="1.125rem" />
                      </ActionIcon>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDotsVertical size="1.125rem" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            icon={<IconEye size="1rem" />} 
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconDownload size="1rem" />} 
                            onClick={() => handleDownloadDocument(doc.id)}
                          >
                            Download
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconEdit size="1rem" />} 
                            onClick={() => handleEditDocument(doc.id)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconTrash size="1rem" />} 
                            color="red" 
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
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

export default DocumentsPage;