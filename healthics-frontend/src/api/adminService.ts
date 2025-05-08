import apiClient from './apiClient';
import { Document } from './documentService';

// Match the actual API response structure from /api/admin/statistics
export interface SystemStatistics {
  totalPatients: number;
  totalDocuments: number;
  totalStorageUsed: number;
  activeUsers: number;
  inactiveUsers: number;
  documentsUploadedToday: number;
  documentsUploadedThisMonth: number;
}

// Match the actual API response structure from /api/admin/patients
export interface PatientResponse {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    password: string;
    roles: {
      id: number;
      name: string;
    }[];
    active: boolean;
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
}

const adminService = {
  getAllPatients: async () => {
    try {
      console.log('Fetching all patients');
      const response = await apiClient.get<PatientResponse[]>('/admin/patients');
      console.log('Patients response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  getSystemStatistics: async () => {
    try {
      console.log('Fetching system statistics...');
      const response = await apiClient.get<SystemStatistics>('/admin/statistics');
      console.log('Statistics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  updatePatientStatus: async (patientId: number, active: boolean) => {
    try {
      console.log(`Updating patient ${patientId} status to ${active}`);
      const response = await apiClient.put(`/admin/patients/${patientId}/status?active=${active}`);
      console.log('Update status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw error;
    }
  },

  // Get documents for a specific patient (admin access)
  getPatientDocuments: async (patientId: number) => {
    try {
      console.log(`Fetching documents for patient ${patientId}`);
      // Use the correct endpoint for fetching patient documents
      const response = await apiClient.get<Document[]>(`/admin/patients/${patientId}/documents`);
      console.log('Patient documents response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for patient ${patientId}:`, error);
      throw error;
    }
  },

  // Download a specific document (admin access)
  downloadDocument: async (documentId: number) => {
    try {
      console.log(`Admin downloading document ${documentId}`);
      const response = await apiClient.get<Blob>(`/admin/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading document ${documentId}:`, error);
      throw error;
    }
  },

  // Mock data for testing
  getMockStatistics: (): SystemStatistics => {
    return {
      totalPatients: 4,
      totalDocuments: 2,
      totalStorageUsed: 235730,
      activeUsers: 4,
      inactiveUsers: 0,
      documentsUploadedToday: 2,
      documentsUploadedThisMonth: 2
    };
  },

  getMockPatients: (): PatientResponse[] => {
    return [
      {
        "id": 1,
        "user": {
          "id": 5,
          "username": "tomy",
          "email": "tomy@example.com",
          "password": "$2a$10$IJlRsqmI67GqTkisPdvlp.Lton9SkX7Umg/2AMHTFdeoHs99CG4Bi",
          "roles": [
            {
              "id": 1,
              "name": "ROLE_PATIENT"
            }
          ],
          "active": true
        },
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-15",
        "phoneNumber": "123-456-7890",
        "address": "123 Main St, Anytown, USA",
        "medicalHistory": "No significant medical history",
        "allergies": "Penicillin",
        "medications": "None",
        "emergencyContact": "Jane Doe, 987-654-3210"
      },
      {
        "id": 2,
        "user": {
          "id": 6,
          "username": "ahmed",
          "email": "ahmed@example.com",
          "password": "$2a$10$anqa9m.j29UqtE9hF6ZlreXIbsLrvMM0c8a3begMrJzTUl4enxK8O",
          "roles": [
            {
              "id": 1,
              "name": "ROLE_PATIENT"
            }
          ],
          "active": true
        },
        "firstName": "Ahmed",
        "lastName": "Duffy",
        "dateOfBirth": "1973-04-24",
        "phoneNumber": "+1 (135) 233-5915",
        "address": "Nisi consequat Pari",
        "medicalHistory": "Hic et cum provident",
        "allergies": "Autem in ipsum nost",
        "medications": "Sint nisi eos quis ",
        "emergencyContact": "Illo impedit deleni"
      }
    ];
  }
};

export default adminService;