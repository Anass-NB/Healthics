import apiClient from './apiClient';

// Type definitions
export interface PredictDiseaseResponse {
  status: string;
  prediction: {
    primary_prediction: {
      disease: string;
      confidence: number;
    };
    differential_diagnoses: {
      disease: string;
      probability: number;
    }[];
    disclaimer: string;
  };
}

export interface ChatWithAIResponse {
  status: string;
  response: string;
}

export interface DrugInteractionsResponse {
  status: string;
  medications: string[];
  interactions: string;
}

/**
 * Service for interacting with the health advisor API endpoints
 */
const healthAdvisorService = {
  /**
   * Predict disease based on symptoms
   * @param symptoms Array of symptom strings
   * @returns Prediction result with disease and confidence score
   */
  predictDisease: async (symptoms: string[]): Promise<PredictDiseaseResponse> => {
    try {
      console.log("Calling predict-disease API with symptoms:", symptoms);
      const response = await apiClient.post('/health/predict-disease', { symptoms });
      console.log("Received prediction response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling predict-disease API:", error);
      throw error;
    }
  },

  /**
   * Chat with AI about medical information
   * @param message User message
   * @returns AI response
   */
  chatWithAI: async (message: string): Promise<ChatWithAIResponse> => {
    try {
      console.log("Calling chat API with message:", message);
      const response = await apiClient.post('/health/chat', { message });
      console.log("Received chat response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling chat API:", error);
      throw error;
    }
  },

  /**
   * Check drug interactions
   * @param medications Array of medication names
   * @returns Information about potential drug interactions
   */
  checkDrugInteractions: async (medications: string[]): Promise<DrugInteractionsResponse> => {
    try {
      console.log("Calling drug-interactions API with medications:", medications);
      const response = await apiClient.post('/health/drug-interactions', { medications });
      console.log("Received drug interactions response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling drug-interactions API:", error);
      throw error;
    }
  }
};

export default healthAdvisorService;