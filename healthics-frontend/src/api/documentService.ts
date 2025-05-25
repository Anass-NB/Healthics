import apiClient from './apiClient';

export interface DocumentCategory {
  id: number;
  name: string;
  description: string;
}

// Document interface to match the actual API response
export interface Document {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  doctorName: string;
  hospitalName: string;
  documentDate: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModifiedDate: string;
  downloadUrl: string;
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
      // Get the current authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to download documents');
      }

      // Use axios to handle the request with explicit authentication headers
      const response = await apiClient.get(`/documents/${id}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Create a blob URL and trigger the download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Try to get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document-${id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
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