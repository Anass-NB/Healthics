package com.healthics.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.healthics.backend.service.HealthAdvisorService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthAdvisorController {

    @Autowired
    private HealthAdvisorService healthAdvisorService;

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "HealthCare API is up and running!"
        ));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "No message provided"
            ));
        }
        
        Map<String, Object> response = healthAdvisorService.chatWithAI(message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict-disease")
    public ResponseEntity<?> predictDisease(@RequestBody Map<String, List<String>> request) {
        List<String> symptoms = request.get("symptoms");
        if (symptoms == null || symptoms.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "No symptoms provided"
            ));
        }
        
        Map<String, Object> response = healthAdvisorService.predictDisease(symptoms);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/drug-interactions")
    public ResponseEntity<?> checkDrugInteractions(@RequestBody Map<String, List<String>> request) {
        List<String> medications = request.get("medications");
        if (medications == null || medications.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "At least two medications are required to check interactions"
            ));
        }
        
        Map<String, Object> response = healthAdvisorService.checkDrugInteractions(medications);
        return ResponseEntity.ok(response);
    }
}