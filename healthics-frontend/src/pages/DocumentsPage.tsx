import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Button, Group, Table, Badge, ActionIcon, Text, Menu, TextInput, Select, Alert, LoadingOverlay } from '@mantine/core';
import documentService, { Document, DocumentCategory } from '../api/documentService';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch document categories and all documents for the current user
        const [docsData, catsData] = await Promise.all([
          documentService.getAllDocuments(),
          documentService.getCategories()
        ]);
        
        setDocuments(docsData);
        setCategories(catsData);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setError(error.response?.data?.message || 'Failed to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDocument = (id: number) => {
    navigate(`/documents/${id}`);
  };

  const handleEditDocument = (id: number) => {
    // Only patients can edit documents
    if (!isAdmin()) {
      navigate(`/documents/${id}/edit`);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    // Only patients can delete documents
    if (!isAdmin() && window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        notifications.show({
          title: 'Success',
          message: 'Document deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete document. Please try again.',
          color: 'red',
        });
      }
    }
  };

  const handleDownloadDocument = async (id: number) => {
    try {
      const document = documents.find(doc => doc.id === id);
      if (!document) return;

      const blob = await documentService.downloadDocument(id);
      
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.doctorName && doc.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.hospitalName && doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter ? doc.categoryId.toString() === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Container size="lg" pos="relative">
      {loading && <LoadingOverlay visible />}
      
      <Group justify="space-between" mb="lg">
        <Title>{isAdmin() ? 'View Documents' : 'My Documents'}</Title>
        
        {/* Only show upload button for patients */}
        {!isAdmin() && (
          <Button onClick={() => navigate('/documents/upload')}>
            Upload New Document
          </Button>
        )}
      </Group>

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Group mb="md">
        <TextInput
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by category"
          data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
          value={categoryFilter}
          onChange={setCategoryFilter}
          clearable
          style={{ width: 200 }}
        />
      </Group>

      {filteredDocuments.length === 0 ? (
        <Text>No documents found.</Text>
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
            {filteredDocuments.map((doc) => (
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
                    {/* Only show edit and delete options for patients */}
                    {!isAdmin() && (
                      <>
                        <Button size="xs" variant="light" onClick={() => handleEditDocument(doc.id)}>
                          Edit
                        </Button>
                        <Button size="xs" color="red" variant="subtle" onClick={() => handleDeleteDocument(doc.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
};

export default DocumentsPage;