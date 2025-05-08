import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Card, Grid, Badge, Divider, LoadingOverlay, Alert } from '@mantine/core';
import documentService, { Document, DocumentCategory } from '../api/documentService';
import adminService from '../api/adminService';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

const DocumentDetailPage = () => {
  const { id, documentId } = useParams<{ id?: string; documentId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine if we're in admin mode based on the URL path
  const isAdminView = location.pathname.startsWith('/admin');
  // Use the appropriate ID parameter
  const docId = documentId || id;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!docId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch document categories
        const categoriesData = await documentService.getCategories();
        setCategories(categoriesData);
        
        // Fetch document based on whether we're in admin view or regular view
        let documentData;
        if (isAdminView && isAdmin()) {
          try {
            // This would need to be implemented in your API
            // For now, let's fall back to regular document fetch
            documentData = await documentService.getDocumentById(parseInt(docId));
          } catch (adminError) {
            console.error('Error fetching document as admin:', adminError);
            documentData = await documentService.getDocumentById(parseInt(docId));
          }
        } else {
          documentData = await documentService.getDocumentById(parseInt(docId));
        }
        
        setDocument(documentData);
      } catch (err: any) {
        console.error('Error fetching document details:', err);
        setError(err.response?.data?.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docId, isAdminView, isAdmin]);

  const handleDownload = async () => {
    if (!docId || !document) return;
    
    try {
      let blob;
      
      // Use the appropriate download method based on whether we're in admin view
      if (isAdminView && isAdmin()) {
        blob = await adminService.downloadDocument(parseInt(docId));
      } else {
        blob = await documentService.downloadDocument(parseInt(docId));
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename || `document-${docId}.pdf`;
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

  const handleEdit = () => {
    // Only allow editing in regular view, not admin view
    if (!isAdminView) {
      navigate(`/documents/${docId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!docId) return;
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(parseInt(docId));
        notifications.show({
          title: 'Success',
          message: 'Document deleted successfully',
          color: 'green',
        });
        
        // Navigate back based on current view
        if (isAdminView) {
          navigate('/admin/dashboard');
        } else {
          navigate('/documents');
        }
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete document. Please try again.',
          color: 'red',
        });
      }
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGoBack = () => {
    if (isAdminView) {
      // In admin view, go back to admin dashboard
      if (location.pathname.includes('/patients/')) {
        navigate(-1); // Go back to the patient documents view
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      // In regular view, go back to documents page
      navigate('/documents');
    }
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
      <Group justify="space-between" mb="lg">
        <Title>{document.title}</Title>
        <Group>
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
          {!isAdminView && ( // Only show edit/delete in regular view
            <>
              <Button variant="light" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="filled" color="red" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </Group>
      </Group>

      <Card shadow="xs" withBorder mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>Category</Text>
            <Badge size="lg" mb="md">{getCategoryName(document.categoryId)}</Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>Document Date</Text>
            <Text mb="md">{formatDate(document.documentDate)}</Text>
          </Grid.Col>
        </Grid>

        <Divider my="xs" />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>Doctor</Text>
            <Text mb="md">{document.doctorName}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>Hospital/Clinic</Text>
            <Text mb="md">{document.hospitalName}</Text>
          </Grid.Col>
        </Grid>

        {/* Show patient info in admin view */}
        {isAdminView && document.patientName && (
          <>
            <Divider my="xs" />
            <Grid>
              <Grid.Col span={12}>
                <Text fw={500}>Patient</Text>
                <Text mb="md">{document.patientName}</Text>
              </Grid.Col>
            </Grid>
          </>
        )}

        <Divider my="xs" />

        <Grid>
          <Grid.Col span={12}>
            <Text fw={500}>Description</Text>
            <Text mb="md">{document.description}</Text>
          </Grid.Col>
        </Grid>

        <Divider my="xs" />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>File Name</Text>
            <Text mb="md">{document.filename}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text fw={500}>File Size</Text>
            <Text mb="md">{formatFileSize(document.fileSize)}</Text>
          </Grid.Col>
        </Grid>

        <Divider my="xs" />

        <Grid>
          <Grid.Col span={12}>
            <Text fw={500}>Upload Date</Text>
            <Text>{formatDate(document.uploadDate)}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      <Button variant="subtle" onClick={handleGoBack}>
        Back
      </Button>
    </Container>
  );
};

export default DocumentDetailPage;