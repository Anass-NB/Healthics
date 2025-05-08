import apiClient from './apiClient';

export interface DocumentCategory {
  id: number;
  name: string;
  description: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
  filename: string;
  fileSize: number;
  uploadDate: string;
  patientId?: number;
  patientName?: string;
}

export interface UploadDocumentRequest {
  file: File;
  title: string;
  description: string;
  categoryId: number;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
}

export interface UpdateDocumentRequest {
  title: string;
  description: string;
  categoryId: number;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
}

const documentService = {
  getCategories: async () => {
    try {
      const response = await apiClient.get<DocumentCategory[]>('/documents/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching document categories:', error);
      throw error;
    }
  },

  uploadDocument: async (data: UploadDocumentRequest) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('doctorName', data.doctorName);
    formData.append('hospitalName', data.hospitalName);
    formData.append('documentDate', data.documentDate);

    try {
      const response = await apiClient.post<Document>('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  getAllDocuments: async () => {
    try {
      const response = await apiClient.get<Document[]>('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  },

  getDocumentById: async (id: number) => {
    try {
      const response = await apiClient.get<Document>(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  },

  downloadDocument: async (id: number) => {
    try {
      const response = await apiClient.get<Blob>(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading document ${id}:`, error);
      throw error;
    }
  },

  updateDocument: async (id: number, data: UpdateDocumentRequest) => {
    try {
      const response = await apiClient.put<Document>(`/documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  },

  deleteDocument: async (id: number) => {
    try {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  },
};

export default documentService;