import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextInput, Button, Select, Textarea, Group, Stack, Alert, LoadingOverlay } from '@mantine/core';
import PageHeader from '../components/PageHeader';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import documentService, { DocumentCategory, Document } from '../api/documentService';
import { notifications } from '@mantine/notifications';

interface FormValues {
  title: string;
  description: string;
  categoryId: string;
  doctorName: string;
  hospitalName: string;
  documentDate: Date | null;
}

const DocumentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      categoryId: '',
      doctorName: '',
      hospitalName: '',
      documentDate: null,
    },
    validate: {
      title: (value) => (value ? null : 'Title is required'),
      categoryId: (value) => (value ? null : 'Category is required'),
      documentDate: (value) => (value ? null : 'Document date is required'),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [documentData, categoriesData] = await Promise.all([
          documentService.getDocumentById(parseInt(id)),
          documentService.getCategories()
        ]);
        
        setDocument(documentData);
        setCategories(categoriesData);
        
        form.setValues({
          title: documentData.title,
          description: documentData.description,
          categoryId: documentData.categoryId.toString(),
          doctorName: documentData.doctorName,
          hospitalName: documentData.hospitalName,
          documentDate: new Date(documentData.documentDate),
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (values: FormValues) => {
    if (!id || !values.documentDate) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateData = {
        title: values.title,
        description: values.description,
        categoryId: parseInt(values.categoryId),
        doctorName: values.doctorName,
        hospitalName: values.hospitalName,
        documentDate: values.documentDate.toISOString(),
      };

      await documentService.updateDocument(parseInt(id), updateData);
      
      notifications.show({
        title: 'Success',
        message: 'Document updated successfully',
        color: 'green',
      });
      
      navigate(`/documents/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container size="md" pos="relative" h={400}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error && !document) {
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

  return (
    <Container size="md">
      <PageHeader title="Edit Document" />

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Document Title"
            placeholder="Enter document title"
            {...form.getInputProps('title')}
            disabled={submitting}
          />

          <Select
            required
            label="Category"
            placeholder="Select document category"
            data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            {...form.getInputProps('categoryId')}
            disabled={submitting}
          />

          <Textarea
            label="Description"
            placeholder="Enter document description"
            {...form.getInputProps('description')}
            disabled={submitting}
          />

          <Group grow>
            <TextInput
              label="Doctor Name"
              placeholder="Enter doctor name"
              {...form.getInputProps('doctorName')}
              disabled={submitting}
            />

            <TextInput
              label="Hospital/Clinic Name"
              placeholder="Enter hospital or clinic name"
              {...form.getInputProps('hospitalName')}
              disabled={submitting}
            />
          </Group>

          <DateTimePicker
            required
            label="Document Date"
            placeholder="Select document date and time"
            value={form.values.documentDate}
            onChange={(date) => form.setFieldValue('documentDate', date)}
            error={form.errors.documentDate}
            disabled={submitting}
          />

          <Group justify="space-between" mt="xl">
            <Button variant="subtle" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Update Document
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};

export default DocumentEditPage;