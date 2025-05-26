package com.healthics.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class HealthAdvisorService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key: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}")
    private String groqApiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public HealthAdvisorService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Chat with AI about medical information
     * @param message User message
     * @return AI response
     */
    public Map<String, Object> chatWithAI(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are a healthcare assistant providing accurate medical information. Always include a disclaimer that your advice should not replace professional medical consultation.");

            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", message);

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(systemMessage);
            messages.add(userMessage);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama3-8b-8192");
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(GROQ_API_URL, request, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> messageContent = (Map<String, Object>) firstChoice.get("message");
            String aiResponse = (String) messageContent.get("content");

            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("response", aiResponse);

            return result;
        } catch (Exception e) {
            e.printStackTrace(); // Full stack trace

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Check for potential drug interactions
     * @param medications List of medication names
     * @return Information about potential interactions
     */
    public Map<String, Object> checkDrugInteractions(List<String> medications) {
        try {
            if (medications == null || medications.size() < 2) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "At least two medications are required to check interactions");
                return errorResponse;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are a healthcare assistant providing information about drug interactions. Always include a disclaimer that this information should be verified by a healthcare professional.");

            String medicationsString = String.join(", ", medications);
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "What are the potential interactions between these medications: " + medicationsString + "?");

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(systemMessage);
            messages.add(userMessage);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama3-8b-8192");
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(GROQ_API_URL, request, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> messageContent = (Map<String, Object>) firstChoice.get("message");
            String interactionInfo = (String) messageContent.get("content");

            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("medications", medications);
            result.put("interactions", interactionInfo);

            return result;
        } catch (Exception e) {
            e.printStackTrace(); // Full stack trace

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Predict disease based on symptoms using the embedded model
     * @param symptoms List of symptom strings
     * @return Prediction result with disease and confidence score
     */
    public Map<String, Object> predictDisease(List<String> symptoms) {
        try {
            if (symptoms == null || symptoms.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "No symptoms provided");
                return errorResponse;
            }

            // Here we'll implement a simple rule-based prediction model
            // This replaces the machine learning model in the Flask app

            // Define symptom-disease mappings (from the Flask app's disease_prediction.py)
            Map<String, List<String>> diseaseSymptomMap = new HashMap<>();
            diseaseSymptomMap.put("Common Cold", Arrays.asList("fever", "cough", "sore_throat", "runny_nose", "congestion"));
            diseaseSymptomMap.put("Influenza", Arrays.asList("fever", "cough", "fatigue", "muscle_pain", "headache", "chills"));
            diseaseSymptomMap.put("COVID-19", Arrays.asList("fever", "cough", "fatigue", "shortness_of_breath", "loss_of_taste", "loss_of_smell"));
            diseaseSymptomMap.put("Pneumonia", Arrays.asList("fever", "cough", "shortness_of_breath", "chest_pain", "fatigue"));
            diseaseSymptomMap.put("Allergic Rhinitis", Arrays.asList("runny_nose", "congestion", "sore_throat", "headache"));
            diseaseSymptomMap.put("Gastroenteritis", Arrays.asList("nausea", "vomiting", "diarrhea", "abdominal_pain", "fever"));
            diseaseSymptomMap.put("Migraine", Arrays.asList("headache", "nausea", "dizziness", "sensitivity_to_light"));
            diseaseSymptomMap.put("Urinary Tract Infection", Arrays.asList("fever", "frequent_urination", "painful_urination", "abdominal_pain"));
            diseaseSymptomMap.put("Asthma", Arrays.asList("shortness_of_breath", "wheezing", "chest_pain", "cough"));
            diseaseSymptomMap.put("Bronchitis", Arrays.asList("cough", "chest_pain", "fatigue", "shortness_of_breath"));

            // Calculate matches for each disease
            Map<String, Double> diseaseScores = new HashMap<>();

            for (Map.Entry<String, List<String>> entry : diseaseSymptomMap.entrySet()) {
                String disease = entry.getKey();
                List<String> diseaseSymptoms = entry.getValue();

                // Count matching symptoms
                int matchCount = 0;
                for (String symptom : symptoms) {
                    if (diseaseSymptoms.contains(symptom)) {
                        matchCount++;
                    }
                }

                // Calculate score (matches / total disease symptoms)
                double score = diseaseSymptoms.isEmpty() ? 0 : (double) matchCount / diseaseSymptoms.size();

                diseaseScores.put(disease, score);
            }

            // Sort diseases by score
            List<Map.Entry<String, Double>> sortedDiseases = new ArrayList<>(diseaseScores.entrySet());
            sortedDiseases.sort(Map.Entry.<String, Double>comparingByValue().reversed());

            // Create prediction result
            Map<String, Object> primaryPrediction = new HashMap<>();
            String topDisease = sortedDiseases.get(0).getKey();
            double topScore = sortedDiseases.get(0).getValue();

            primaryPrediction.put("disease", topDisease);
            primaryPrediction.put("confidence", topScore);

            List<Map<String, Object>> differentialDiagnoses = new ArrayList<>();

            // Add differential diagnoses (if more than one disease with score > 0.05)
            for (int i = 1; i < Math.min(3, sortedDiseases.size()); i++) {
                Map.Entry<String, Double> entry = sortedDiseases.get(i);
                if (entry.getValue() > 0.05) {
                    Map<String, Object> diagnosis = new HashMap<>();
                    diagnosis.put("disease", entry.getKey());
                    diagnosis.put("probability", entry.getValue());
                    differentialDiagnoses.add(diagnosis);
                }
            }

            Map<String, Object> prediction = new HashMap<>();
            prediction.put("primary_prediction", primaryPrediction);
            prediction.put("differential_diagnoses", differentialDiagnoses);
            prediction.put("disclaimer", "This prediction is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.");

            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("prediction", prediction);

            return result;
        } catch (Exception e) {
            e.printStackTrace(); // Full stack trace

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }
}