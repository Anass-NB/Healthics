import apiClient from './apiClient';

export interface PatientProfile {
  id?: number;
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

const patientService = {
  getProfile: async () => {
    const response = await apiClient.get<PatientProfile>('/patients/profile');
    return response.data;
  },

  createProfile: async (profile: PatientProfile) => {
    const response = await apiClient.post<PatientProfile>('/patients/profile', profile);
    return response.data;
  },

  updateProfile: async (profile: PatientProfile) => {
    const response = await apiClient.put<PatientProfile>('/patients/profile', profile);
    return response.data;
  },

  getPatientById: async (id: number) => {
    const response = await apiClient.get<PatientProfile>(`/patients/${id}`);
    return response.data;
  },
};

export default patientService;