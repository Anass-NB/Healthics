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
  ActionIcon,
  Paper,
  Title,
  Box
} from '@mantine/core';
import { IconDownload, IconArrowLeft, IconFile } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container style={{ position: 'relative', height: 400 }}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button style={{ marginTop: '16px' }} onClick={handleGoBack}>
          Back
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container>
        <Alert color="red" title="Not Found">
          Document not found.
        </Alert>
        <Button style={{ marginTop: '16px' }} onClick={handleGoBack}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <ActionIcon size="lg" variant="subtle" onClick={handleGoBack}>
          <IconArrowLeft />
        </ActionIcon>
        <Title order={2}>Document Details</Title>
      </Box>

      <Paper style={{ padding: '20px', marginBottom: '20px', border: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title order={3}>{document.title}</Title>
          <Button 
            onClick={handleDownload}
            loading={downloadLoading}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <IconDownload size="1rem" style={{ marginRight: '0.5rem' }} />
            Download
          </Button>
        </Box>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card style={{ border: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Box style={{ 
                borderBottom: '1px solid #eee', 
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: 500 }}>Document Information</Text>
                <Badge>{document.categoryName}</Badge>
              </Box>
              
              <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>Document Date:</Text>
                  <Text>{formatDate(document.documentDate)}</Text>
                </Box>
                
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>Doctor:</Text>
                  <Text>{document.doctorName || 'Not specified'}</Text>
                </Box>
                
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>Hospital/Clinic:</Text>
                  <Text>{document.hospitalName || 'Not specified'}</Text>
                </Box>
              </Box>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card style={{ 
              border: '1px solid #eee', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              height: '100%'
            }}>
              <Box style={{ 
                borderBottom: '1px solid #eee', 
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: 500 }}>File Information</Text>
                <IconFile size="1.2rem" />
              </Box>
              
              <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>File Type:</Text>
                  <Text>{document.fileType}</Text>
                </Box>
                
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>File Size:</Text>
                  <Text>{formatFileSize(document.fileSize)}</Text>
                </Box>
                
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>Upload Date:</Text>
                  <Text>{formatDate(document.uploadDate)}</Text>
                </Box>
                
                <Box style={{ display: 'flex' }}>
                  <Text style={{ width: '150px', fontSize: '14px', fontWeight: 500 }}>Last Modified:</Text>
                  <Text>{formatDate(document.lastModifiedDate)}</Text>
                </Box>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider style={{ margin: '20px 0' }} />
        
        <Text style={{ fontWeight: 500, marginBottom: '8px' }}>Description</Text>
        <Text>{document.description || 'No description provided.'}</Text>
      </Paper>
    </Container>
  );
};

export default AdminDocumentDetailPage;
