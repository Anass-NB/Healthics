import apiClient from './apiClient';
import { Document } from './documentService';
import {
  mockAnalyticsResults,
  mockPatientAnalysis,
  mockMedicalConditions,
  mockHealthcareTrends,
  mockAnalyticsDashboard,
  mockHealthAnalytics,
  isMockMode
} from '../utils/mockAnalyticsData';

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

// Extended statistics for charts and visualizations
export interface ExtendedStatistics {
  totalPatients: number;
  totalDocuments: number;
  totalStorageUsed: number;
  activePatients: number;
  inactivePatients: number;
  bannedPatients: number;
  patientsWithoutProfiles: number;
  monthlyUploads: Record<string, number>;
  documentTypes: Record<string, number>;
  patientRegistrations: Record<string, number>;
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
    banned?: boolean;
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
  documentCount?: number;
}

// Extended Document interface that includes user information
export interface ExtendedDocument extends Document {
  userId: number;
  username: string;
}

export interface AnalyticsResult {
  status: string;
  timestamp: string;
  [key: string]: any;
}

export interface PatientAnalysisResult extends AnalyticsResult {
  patientId: number;
  documentCount: number;
  medicalTermsFrequency: Record<string, number>;
  sentimentAnalysis: {
    overall: string;
    score: number;
    positiveTermsCount: number;
    negativeTermsCount: number;
  };
  categoryDistribution: Record<string, number>;
  analysisType: string;
}

export interface MedicalConditionsResult extends AnalyticsResult {
  totalDocuments: number;
  conditionCounts: Record<string, number>;
  totalConditionMentions: number;
  averageMentionsPerCondition: number;
  mostCommonCondition: string;
}

export interface HealthcareTrendsResult extends AnalyticsResult {
  totalDocuments: number;
  categoryDistribution: Record<string, number>;
  uploadPatterns: Record<string, number>;
  analysisType: string;
}

export interface AnalyticsDashboard extends AnalyticsResult {
  medicalConditions: MedicalConditionsResult;
  healthcareTrends: HealthcareTrendsResult;
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
  
  // New method to get patients with a specific endpoint
  getPatients: async (endpoint: string) => {
    try {
      console.log(`Fetching patients from ${endpoint}`);
      const response = await apiClient.get(endpoint);
      console.log('Patients response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patients from ${endpoint}:`, error);
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
  
  getExtendedStatistics: async () => {
    try {
      console.log('Fetching extended statistics...');
      const response = await apiClient.get<ExtendedStatistics>('/admin/statistics/extended');
      console.log('Extended statistics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching extended statistics:', error);
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
  
  updatePatientBanStatus: async (patientId: number, banned: boolean) => {
    try {
      console.log(`Updating patient ${patientId} ban status to ${banned}`);
      const response = await apiClient.put(`/admin/patients/${patientId}/ban?banned=${banned}`);
      console.log('Update ban status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient ban status:', error);
      throw error;
    }
  },

  // Get all documents in the system (admin access)
  getAllDocuments: async () => {
    try {
      console.log('Fetching all documents in the system');
      const response = await apiClient.get<ExtendedDocument[]>('/admin/documents');
      console.log('All documents response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  },

  // Get documents for a specific patient (admin access)
  getPatientDocuments: async (patientId: number) => {
    try {
      console.log(`Fetching documents for patient ${patientId}`);
      
      // Add more debug info
      console.log(`Using endpoint: /admin/patients/${patientId}/documents`);
      
      // Make the API call with additional logging
      try {
        const response = await apiClient.get<Document[]>(`/admin/patients/${patientId}/documents`);
        console.log('Patient documents response:', response.data);
        return response.data;
      } catch (apiError: any) {
        // Log detailed error information
        console.error('API Error details:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        // Try to access the endpoint in a different way if needed
        if (apiError.response?.status === 404) {
          console.log('Trying alternate approach to fetch documents');
          // If the main endpoint fails, try to get all documents and filter by patient
          const allDocsResponse = await apiClient.get<ExtendedDocument[]>('/admin/documents');
          const filteredDocs = allDocsResponse.data.filter(doc => doc.userId === patientId);
          console.log(`Found ${filteredDocs.length} documents for patient ${patientId} using alternate method`);
          return filteredDocs;
        }
        
        throw apiError;
      }
    } catch (error) {
      console.error(`Error fetching documents for patient ${patientId}:`, error);
      throw error;
    }
  },

  // Download a specific document (admin access)
  downloadDocument: async (documentId: number) => {
    try {
      console.log(`Admin downloading document ${documentId}`);
      // Use axios to properly include auth token
      const response = await apiClient.get(`/admin/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      // Try to get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document-${documentId}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      return { blob, filename };
    } catch (error) {
      console.error(`Error downloading document ${documentId}:`, error);
      throw error;
    }
  },
  // Big Data Analytics Methods
  async analyzePatientDocuments(patientId: number): Promise<PatientAnalysisResult> {
    if (isMockMode()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPatientAnalysis;
    }
    const response = await apiClient.get(`/api/analysis/patient/${patientId}`);
    return response.data;
  },

  async extractMedicalConditions(): Promise<MedicalConditionsResult> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockMedicalConditions;
    }
    const response = await apiClient.get('/api/analysis/conditions');
    return response.data;
  },

  async analyzeHealthcareTrends(): Promise<HealthcareTrendsResult> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockHealthcareTrends;
    }
    const response = await apiClient.get('/api/analysis/trends');
    return response.data;
  },

  async getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockAnalyticsDashboard;
    }
    const response = await apiClient.get('/api/analysis/dashboard');
    return response.data;
  },

  // Health Analytics Service Methods
  async getHealthAnalyticsDashboard(): Promise<any> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockHealthAnalytics.sampleAnalytics;
    }
    const response = await apiClient.get('/api/health-analytics/dashboard');
    return response.data;
  },

  async analyzeSampleHealthcareData(): Promise<any> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return mockHealthAnalytics.sampleAnalytics;
    }
    const response = await apiClient.get('/api/health-analytics/sample-analysis');
    return response.data;
  },

  async performMLAnalysis(): Promise<any> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return mockHealthAnalytics.mlAnalysis;
    }
    const response = await apiClient.get('/api/health-analytics/ml-analysis');
    return response.data;
  },

  async generatePredictiveAnalytics(): Promise<any> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 900));
      return mockHealthAnalytics.predictiveAnalytics;
    }
    const response = await apiClient.get('/api/health-analytics/predictive-analytics');
    return response.data;
  },

  async getAnalyticsSystemInfo(): Promise<any> {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockHealthAnalytics.systemInfo;
    }
    const response = await apiClient.get('/api/health-analytics/system-info');
    return response.data;
  },

  // Mock data for testing
  getMockStatistics: (): SystemStatistics => {
    return {
      totalPatients: 4,
      totalDocuments: 7,
      totalStorageUsed: 2357300,
      activeUsers: 3,
      inactiveUsers: 1,
      documentsUploadedToday: 2,
      documentsUploadedThisMonth: 5
    };
  },
  
  getMockExtendedStatistics: (): ExtendedStatistics => {
    return {
      totalPatients: 4,
      totalDocuments: 7,
      totalStorageUsed: 2357300,
      activePatients: 3,
      inactivePatients: 1, 
      bannedPatients: 0,
      patientsWithoutProfiles: 1,
      monthlyUploads: {
        "JANUARY": 1,
        "FEBRUARY": 0,
        "MARCH": 2,
        "APRIL": 0,
        "MAY": 3,
        "JUNE": 1
      },
      documentTypes: {
        "Lab Results": 3,
        "Prescription": 2,
        "Radiology": 1,
        "Other": 1
      },
      patientRegistrations: {
        "JANUARY": 0,
        "FEBRUARY": 1,
        "MARCH": 2,
        "APRIL": 0,
        "MAY": 1,
        "JUNE": 0
      }
    };
  },

  getMockPatients: (): any[] => {
    return [
      {
        "id": 1,
        "username": "tomy",
        "email": "tomy@example.com",
        "active": true,
        "banned": false,
        "hasProfile": true,
        "firstName": "John",
        "lastName": "Doe",
        "profileId": 1,
        "documentCount": 3
      },
      {
        "id": 2,
        "username": "ahmed",
        "email": "ahmed@example.com",
        "active": true,
        "banned": false,
        "hasProfile": true,
        "firstName": "Ahmed",
        "lastName": "Duffy",
        "profileId": 2,
        "documentCount": 2
      },
      {
        "id": 3,
        "username": "maria",
        "email": "maria@example.com",
        "active": false,
        "banned": false,
        "hasProfile": true,
        "firstName": "Maria",
        "lastName": "Garcia",
        "profileId": 3,
        "documentCount": 1
      },
      {
        "id": 4,
        "username": "newuser",
        "email": "newuser@example.com",
        "active": true,
        "banned": false,
        "hasProfile": false,
        "documentCount": 0
      }
    ];
  },
  
  getMockDocuments: (): ExtendedDocument[] => {
    return [
      {
        id: 1,
        title: "Blood Test Results",
        description: "Annual blood work results",
        fileType: "application/pdf",
        fileSize: 245760,
        categoryId: 1,
        categoryName: "Lab Results",
        doctorName: "Dr. Smith",
        hospitalName: "General Hospital",
        documentDate: "2023-04-15T10:30:00",
        uploadDate: "2023-04-16T14:22:33",
        lastModifiedDate: "2023-04-16T14:22:33",
        downloadUrl: "/api/admin/documents/1/download",
        userId: 1,
        username: "tomy"
      },
      {
        id: 2,
        title: "X-Ray Chest",
        description: "Chest X-ray for pneumonia check",
        fileType: "image/jpeg",
        fileSize: 1245760,
        categoryId: 2,
        categoryName: "Radiology",
        doctorName: "Dr. Johnson",
        hospitalName: "City Medical Center",
        documentDate: "2023-05-22T09:15:00",
        uploadDate: "2023-05-22T16:45:10",
        lastModifiedDate: "2023-05-22T16:45:10",
        downloadUrl: "/api/admin/documents/2/download",
        userId: 1,
        username: "tomy"
      },
      {
        id: 3,
        title: "Prescription - Antibiotics",
        description: "Prescription for respiratory infection",
        fileType: "application/pdf",
        fileSize: 125760,
        categoryId: 3,
        categoryName: "Prescription",
        doctorName: "Dr. Williams",
        hospitalName: "General Hospital",
        documentDate: "2023-05-25T11:30:00",
        uploadDate: "2023-05-25T12:10:15",
        lastModifiedDate: "2023-05-25T12:10:15",
        downloadUrl: "/api/admin/documents/3/download",
        userId: 2,
        username: "ahmed"
      }
    ];
  }
};

export default adminService;