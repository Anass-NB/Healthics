import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Button, 
  Group, 
  Table, 
  Badge, 
  ActionIcon, 
  Menu, 
  Text, 
  Alert, 
  LoadingOverlay, 
  Paper,
  ThemeIcon
} from '@mantine/core';
import { IconDownload, IconEye, IconEdit, IconTrash, IconDotsVertical, IconPlus, IconUpload } from '@tabler/icons-react';
import documentService, { Document } from '../api/documentService';
import { notifications } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const navigate = useNavigate();

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
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />
        <PageHeader
        title="My Documents"
      />

      <Group justify="flex-end" mb="xl">        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={() => navigate('/documents/upload')}
          variant="gradient"
          gradient={{ from: 'medicalBlue', to: 'blue' }}
          size="md"
          radius="xl"
        >
          Upload Document
        </Button>
      </Group>

      {error && (
        <Alert 
          color="red" 
          mb="xl" 
          title="Error" 
          withCloseButton 
          onClose={() => setError(null)}
          radius="md"
        >
          {error}
        </Alert>
      )}

      {documents.length === 0 && !loading ? (
        <EmptyState
          title="No Documents Found"
          description="You haven't uploaded any documents yet. Click the upload button to add your first document."          icon={
            <ThemeIcon size={80} radius={100} color="medicalBlue.1" variant="light">
              <IconUpload size={40} color="var(--mantine-color-medicalBlue-6)" />
            </ThemeIcon>
          }
          primaryAction={{
            label: "Upload Your First Document",
            onClick: () => navigate('/documents/upload'),
            icon: <IconPlus size={16} />
          }}
        />
      ) : (
        <Paper 
          shadow="sm" 
          p="xl" 
          radius="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Text size="sm" c="dimmed" mb="md">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </Text>
          
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
                <Table.Tr key={doc.id}>                  <Table.Td>
                    <Text fw={500} c="medicalBlue">{doc.title}</Text>
                  </Table.Td>                  <Table.Td>
                    <Badge variant="light" color="medicalBlue" size="sm">
                      {doc.categoryName || 'Uncategorized'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{doc.doctorName || 'Not specified'}</Text>
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
                        radius="xl"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="green" 
                        onClick={() => handleDownloadDocument(doc.id)}
                        title="Download document"
                        loading={downloadingId === doc.id}
                        size="lg"
                        radius="xl"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="yellow" 
                        onClick={() => handleEditDocument(doc.id)}
                        title="Edit document"
                        size="lg"
                        radius="xl"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red" 
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete document"
                        size="lg"
                        radius="xl"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="lg" radius="xl">
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
                          <Menu.Item 
                            leftSection={<IconEdit size={14} />} 
                            onClick={() => handleEditDocument(doc.id)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={14} />} 
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
        </Paper>
      )}    </Container>
  );
};

export default DocumentsPage;