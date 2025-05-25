import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Text, 
  Button, 
  Group, 
  Card, 
  Grid, 
  Badge, 
  Divider, 
  LoadingOverlay, 
  Alert,
  ActionIcon,
  Paper
} from '@mantine/core';
import { IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import PageHeader from '../components/PageHeader';
import documentService from '../api/documentService';
import { notifications } from '@mantine/notifications';

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

const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getDocumentById(parseInt(id));
        setDocument(data);
      } catch (err: any) {
        console.error('Error fetching document details:', err);
        setError(err.response?.data?.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    if (!id || !document) return;
    
    try {
      setDownloadLoading(true);
      // Use our updated service method that preserves authentication
      await documentService.downloadDocument(parseInt(id));
      
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
      setDownloadLoading(false);
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/documents/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !document) return;
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(parseInt(id));
        notifications.show({
          title: 'Success',
          message: 'Document deleted successfully',
          color: 'green',
        });
        navigate('/documents');
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
      return new Date(dateString).toLocaleString();
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
      <Container size="md" pos="relative" h={400}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container size="md">
        <Alert color="red" title="Not Found">
          Document not found.
        </Alert>
        <Button mt="md" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md">
      <PageHeader 
        title={document.title}
      />

      <Paper shadow="xs" p="lg" withBorder mb="lg">
        <Group position="right" mb="lg">
          <Button 
            leftIcon={<IconDownload size="1rem" />} 
            variant="light"
            onClick={handleDownload}
            loading={downloadLoading}
          >
            Download
          </Button>
          <Button 
            leftIcon={<IconEdit size="1rem" />}
            variant="outline" 
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button 
            leftIcon={<IconTrash size="1rem" />} 
            color="red" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm">
              <Card.Section withBorder inheritPadding py="xs">
                <Group position="apart">
                  <Text weight={500}>Document Information</Text>
                  <Badge size="lg">{document.categoryName}</Badge>
                </Group>
              </Card.Section>
              
              <Group mt="md">
                <Text size="sm" weight={500} w={150}>Document Date:</Text>
                <Text>{formatDate(document.documentDate)}</Text>
              </Group>
              
              <Group mt="xs">
                <Text size="sm" weight={500} w={150}>Doctor:</Text>
                <Text>{document.doctorName || 'Not specified'}</Text>
              </Group>
              
              <Group mt="xs">
                <Text size="sm" weight={500} w={150}>Hospital/Clinic:</Text>
                <Text>{document.hospitalName || 'Not specified'}</Text>
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm" h="100%">
              <Card.Section withBorder inheritPadding py="xs">
                <Text weight={500}>File Information</Text>
              </Card.Section>
              
              <Group mt="md">
                <Text size="sm" weight={500} w={150}>File Type:</Text>
                <Text>{document.fileType}</Text>
              </Group>
              
              <Group mt="xs">
                <Text size="sm" weight={500} w={150}>File Size:</Text>
                <Text>{formatFileSize(document.fileSize)}</Text>
              </Group>
              
              <Group mt="xs">
                <Text size="sm" weight={500} w={150}>Upload Date:</Text>
                <Text>{formatDate(document.uploadDate)}</Text>
              </Group>
              
              <Group mt="xs">
                <Text size="sm" weight={500} w={150}>Last Modified:</Text>
                <Text>{formatDate(document.lastModifiedDate)}</Text>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />
        
        <Text weight={500} mb="xs">Description</Text>
        <Text>{document.description || 'No description provided.'}</Text>
      </Paper>
    </Container>
  );
};

export default DocumentDetailPage;