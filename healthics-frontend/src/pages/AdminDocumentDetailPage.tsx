import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Text, 
  Button, 
  Card, 
  Grid, 
  Badge, 
  Divider, 
  LoadingOverlay, 
  Alert,
  Paper,
  Group,
  Stack,
  ThemeIcon
} from '@mantine/core';
import { IconDownload, IconDashboard, IconFile } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import documentService, { Document } from '../api/documentService';
import PageHeader from '../components/PageHeader';

const AdminDocumentDetailPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getDocumentById(parseInt(documentId));
        setDocument(data);
      } catch (err: any) {
        console.error('Error fetching document details:', err);
        setError(err.response?.data?.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleDownload = async () => {
    if (!documentId || !document) return;
    
    try {
      setDownloadLoading(true);
      // Use our updated service method that preserves authentication
      await documentService.downloadDocument(parseInt(documentId));
      
      notifications.show({
        title: 'Success',
        message: 'Document download started',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      
      // Check specifically for authentication errors
      const errorMessage = error.response?.status === 401 
        ? 'Authentication required. Please log in again to download this document.'
        : error.response?.data?.message || 'Failed to download document. Please try again.';
        
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];  };

  if (loading) {
    return (
      <Container size="lg" pos="relative" h={400}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg">
        <PageHeader 
          title="Document Details"
          action={
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              <IconDashboard size={16} style={{ marginRight: 8 }} />
              Dashboard
            </Button>
          }
        />
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={handleGoBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container size="lg">
        <PageHeader 
          title="Document Details"
          action={
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              <IconDashboard size={16} style={{ marginRight: 8 }} />
              Dashboard
            </Button>
          }
        />
        <Alert color="red" title="Not Found">
          Document not found.
        </Alert>
        <Button mt="md" onClick={handleGoBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <PageHeader 
        title="Document Details"
        subtitle={document.title}
        action={
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <IconDashboard size={16} style={{ marginRight: 8 }} />
            Dashboard
          </Button>
        }
      />

      <Paper 
        style={{ 
          padding: '24px', 
          marginBottom: '24px', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Group justify="space-between" mb="xl">
          <Text size="xl" fw={600} c="dark">
            {document.title}
          </Text>          <Button 
            onClick={handleDownload}
            loading={downloadLoading}
            color="medicalBlue"
            size="sm"
            radius="md"
            leftSection={<IconDownload size={16} />}
          >
            Download
          </Button>
        </Group>
        
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm" radius="md" h="100%">
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>Document Information</Text>                  <Badge 
                    color="medicalBlue" 
                    variant="light" 
                    radius="md" 
                    size="sm"
                  >
                    {document.categoryName || 'Uncategorized'}
                  </Badge>
                </Group>
              </Card.Section>
              
              <Stack gap="sm" mt="md">
                <Group>
                  <Text size="sm" fw={500} w={130}>Document Date:</Text>
                  <Text size="sm">{formatDate(document.documentDate)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" fw={500} w={130}>Doctor:</Text>
                  <Text size="sm">{document.doctorName || 'Not specified'}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" fw={500} w={130}>Hospital/Clinic:</Text>
                  <Text size="sm">{document.hospitalName || 'Not specified'}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm" radius="md" h="100%">
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">                <Text fw={500}>File Information</Text>
                  <ThemeIcon color="medicalBlue" variant="light" size="sm" radius="md">
                    <IconFile size={16} />
                  </ThemeIcon>
                </Group>
              </Card.Section>
              
              <Stack gap="sm" mt="md">
                <Group>
                  <Text size="sm" fw={500} w={130}>File Type:</Text>
                  <Text size="sm">{document.fileType}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" fw={500} w={130}>File Size:</Text>
                  <Text size="sm">{formatFileSize(document.fileSize)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" fw={500} w={130}>Upload Date:</Text>
                  <Text size="sm">{formatDate(document.uploadDate)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" fw={500} w={130}>Last Modified:</Text>
                  <Text size="sm">{formatDate(document.lastModifiedDate)}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />
        
        <Stack gap="xs">
          <Text fw={500} size="lg">Description</Text>
          <Text c="dimmed">{document.description || 'No description provided.'}</Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminDocumentDetailPage;
