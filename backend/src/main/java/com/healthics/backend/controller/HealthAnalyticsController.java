package com.healthics.backend.controller;

import com.healthics.backend.service.HealthAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Health Analytics Controller
 * Provides endpoints for big data analytics using Hadoop and Spark
 */
@RestController
@RequestMapping("/api/health-analytics")
public class HealthAnalyticsController {

    @Autowired
    private HealthAnalyticsService healthAnalyticsService;

    /**
     * Analyze sample healthcare data using Apache Spark
     */
    @GetMapping("/sample-analysis")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeSampleData() {
        Map<String, Object> result = healthAnalyticsService.analyzeSampleHealthcareData();
        return ResponseEntity.ok(result);
    }

    /**
     * Perform machine learning analysis on healthcare data
     */
    @GetMapping("/ml-analysis")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> performMLAnalysis() {
        Map<String, Object> result = healthAnalyticsService.performMachineLearningAnalysis();
        return ResponseEntity.ok(result);
    }

    /**
     * Generate predictive analytics for healthcare trends
     */
    @GetMapping("/predictive-analytics")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> generatePredictiveAnalytics() {
        Map<String, Object> result = healthAnalyticsService.generatePredictiveAnalytics();
        return ResponseEntity.ok(result);
    }

    /**
     * Get comprehensive health analytics dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard() {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Get all analytics
            Map<String, Object> sampleAnalysis = healthAnalyticsService.analyzeSampleHealthcareData();
            Map<String, Object> mlAnalysis = healthAnalyticsService.performMachineLearningAnalysis();
            Map<String, Object> predictiveAnalysis = healthAnalyticsService.generatePredictiveAnalytics();
            
            dashboard.put("sampleAnalysis", sampleAnalysis);
            dashboard.put("machineLearning", mlAnalysis);
            dashboard.put("predictiveAnalytics", predictiveAnalysis);
            dashboard.put("status", "success");
            dashboard.put("timestamp", java.time.LocalDateTime.now().toString());
            dashboard.put("description", "Comprehensive health analytics powered by Apache Spark and Hadoop");
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to generate analytics dashboard: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get system health and analytics capabilities
     */
    @GetMapping("/system-info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        Map<String, Object> systemInfo = new HashMap<>();
        systemInfo.put("status", "active");
        systemInfo.put("analyticsEngine", "Apache Spark");
        systemInfo.put("bigDataFramework", "Hadoop");
        systemInfo.put("capabilities", new String[]{
            "Real-time healthcare data analysis",
            "Machine learning for risk assessment",
            "Predictive analytics for healthcare trends",
            "Distributed data processing",
            "Statistical analysis and reporting"
        });
        systemInfo.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(systemInfo);
    }
}
