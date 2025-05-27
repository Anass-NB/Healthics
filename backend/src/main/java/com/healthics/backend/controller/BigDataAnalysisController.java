package com.healthics.backend.controller;

import com.healthics.backend.service.BigDataAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class BigDataAnalysisController {

    @Autowired
    private BigDataAnalysisService bigDataAnalysisService;

    /**
     * Analyze documents for a specific patient
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzePatientDocuments(@PathVariable Long patientId) {
        Map<String, Object> result = bigDataAnalysisService.analyzePatientDocuments(patientId);
        return ResponseEntity.ok(result);
    }

    /**
     * Extract medical conditions from all documents
     */
    @GetMapping("/conditions")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> extractMedicalConditions() {
        Map<String, Object> result = bigDataAnalysisService.extractMedicalConditions();
        return ResponseEntity.ok(result);
    }

    /**
     * Analyze healthcare trends across all documents
     */
    @GetMapping("/trends")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeHealthcareTrends() {
        Map<String, Object> result = bigDataAnalysisService.analyzeHealthcareTrends();
        return ResponseEntity.ok(result);
    }

    /**
     * Get analytics dashboard data
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard() {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Get medical conditions analysis
            Map<String, Object> conditions = bigDataAnalysisService.extractMedicalConditions();
            dashboard.put("medicalConditions", conditions);
            
            // Get healthcare trends
            Map<String, Object> trends = bigDataAnalysisService.analyzeHealthcareTrends();
            dashboard.put("healthcareTrends", trends);
            
            dashboard.put("status", "success");
            dashboard.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to generate analytics dashboard: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}