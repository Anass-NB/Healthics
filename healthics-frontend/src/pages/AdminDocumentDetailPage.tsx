import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
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
  Stack,
  Paper
} from '@mantine/core';
import { IconDownload, IconArrowLeft, IconFile } from '@tabler/icons-react';
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

// Import your actual API services
import documentService from '../api/documentService';

const AdminDocumentDetailPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch document using regular endpoint (admin would have access to all documents)
        const documentData = await documentService.getDocumentById(parseInt(documentId));
        setDocument(documentData);
        
      } catch (err: any) {
        console.error('Error fetching document details:', err);
        setError(err.response?.data?.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleDownload = () => {
    if (!document) return;
    
    // Use the direct download URL from the API response
    window.open(document.downloadUrl, '_blank');
    
    notifications.show({
      title: 'Success',
      message: 'Document download started',
      color: 'green',
    });
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
        <Button mt="md" onClick={handleGoBack}>
          Back
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
        <Button mt="md" onClick={handleGoBack}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Group mb={30}>
        <ActionIcon size="lg" variant="subtle" onClick={handleGoBack}>
          <IconArrowLeft />
        </ActionIcon>
        <Title order={2}>Document Details</Title>
      </Group>

      <Paper shadow="xs" withBorder p="lg" mb="lg">
        <Group position="apart" mb="md">
          <Title order={3}>{document.title}</Title>
          <Button 
            leftIcon={<IconDownload size="1rem" />} 
            onClick={handleDownload}
          >
            Download
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
              
              <Stack spacing="xs" mt="md">
                <Group>
                  <Text size="sm" weight={500} w={150}>Document Date:</Text>
                  <Text>{formatDate(document.documentDate)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" weight={500} w={150}>Doctor:</Text>
                  <Text>{document.doctorName || 'Not specified'}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" weight={500} w={150}>Hospital/Clinic:</Text>
                  <Text>{document.hospitalName || 'Not specified'}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm" h="100%">
              <Card.Section withBorder inheritPadding py="xs">
                <Group position="apart">
                  <Text weight={500}>File Information</Text>
                  <IconFile size="1.2rem" />
                </Group>
              </Card.Section>
              
              <Stack spacing="xs" mt="md">
                <Group>
                  <Text size="sm" weight={500} w={150}>File Type:</Text>
                  <Text>{document.fileType}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" weight={500} w={150}>File Size:</Text>
                  <Text>{formatFileSize(document.fileSize)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" weight={500} w={150}>Upload Date:</Text>
                  <Text>{formatDate(document.uploadDate)}</Text>
                </Group>
                
                <Group>
                  <Text size="sm" weight={500} w={150}>Last Modified:</Text>
                  <Text>{formatDate(document.lastModifiedDate)}</Text>
                </Group>
              </Stack>
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

export default AdminDocumentDetailPage;