import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextInput, Button, Select, Textarea, Group, Stack, Alert, Text } from '@mantine/core';
import PageHeader from '../components/PageHeader';
import { DateTimePicker } from '@mantine/dates';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import documentService, { DocumentCategory } from '../api/documentService';
import { notifications } from '@mantine/notifications';

interface FormValues {
  title: string;
  description: string;
  categoryId: string;
  doctorName: string;
  hospitalName: string;
  documentDate: Date | null;
  file: FileWithPath | null;
}

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      categoryId: '',
      doctorName: '',
      hospitalName: '',
      documentDate: null,
      file: null,
    },
    validate: {
      title: (value) => (value ? null : 'Title is required'),
      categoryId: (value) => (value ? null : 'Category is required'),
      documentDate: (value) => (value ? null : 'Document date is required'),
      file: (value) => (value ? null : 'Document file is required'),
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    if (!values.file || !values.documentDate) return;

    try {
      setSubmitting(true);
      setError(null);

      const documentData = {
        file: values.file,
        title: values.title,
        description: values.description || '',
        categoryId: parseInt(values.categoryId),
        doctorName: values.doctorName || '',
        hospitalName: values.hospitalName || '',
        documentDate: values.documentDate.toISOString(),
      };

      await documentService.uploadDocument(documentData);
      
      notifications.show({
        title: 'Success',
        message: 'Document uploaded successfully',
        color: 'green',
      });
      
      navigate('/documents');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      form.setFieldValue('file', files[0]);
    }
  };

  return (
    <Container size="md">
      <PageHeader title="Upload Document" />

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            required
            label="Document Title"
            placeholder="Enter document title"
            {...form.getInputProps('title')}
            disabled={loading || submitting}
          />

          <Select
            required
            label="Category"
            placeholder="Select document category"
            data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            {...form.getInputProps('categoryId')}
            disabled={loading || submitting}
          />

          <Textarea
            label="Description"
            placeholder="Enter document description"
            {...form.getInputProps('description')}
            disabled={loading || submitting}
          />

          <Group grow>
            <TextInput
              label="Doctor Name"
              placeholder="Enter doctor name"
              {...form.getInputProps('doctorName')}
              disabled={loading || submitting}
            />

            <TextInput
              label="Hospital/Clinic Name"
              placeholder="Enter hospital or clinic name"
              {...form.getInputProps('hospitalName')}
              disabled={loading || submitting}
            />
          </Group>

          <DateTimePicker
            required
            label="Document Date"
            placeholder="Select document date and time"
            value={form.values.documentDate}
            onChange={(date) => form.setFieldValue('documentDate', date)}
            error={form.errors.documentDate}
            disabled={loading || submitting}
          />

          <Stack spacing="xs">
            <Text size="sm" fw={500}>Upload Document File (PDF, JPG, PNG)</Text>
            <Dropzone
              onDrop={handleDrop}
              maxSize={5 * 1024 * 1024} // 5MB
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.png', '.jpeg', '.jpg'],
              }}
              disabled={loading || submitting}
            >
              <Group justify="center" gap="xl" mih={100} style={{ pointerEvents: 'none' }}>
                <div>
                  <Text ta="center">Drag document here or click to select file</Text>
                  <Text ta="center" size="sm" c="dimmed" mt={7}>
                    Maximum file size: 5MB
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {form.values.file && (
              <Text size="sm">
                Selected file: {form.values.file.name} ({Math.round(form.values.file.size / 1024)} KB)
              </Text>
            )}
            {form.errors.file && (
              <Text size="sm" c="red">
                {form.errors.file}
              </Text>
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button variant="subtle" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={loading}>
              Upload Document
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};

export default DocumentUploadPage;