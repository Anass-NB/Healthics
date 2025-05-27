package com.healthics.backend.service;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.functions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Standalone Health Analytics Service using Hadoop and Spark
 * This service provides big data analytics capabilities for healthcare data
 */
@Service
public class HealthAnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(HealthAnalyticsService.class);

    @Value("${app.spark.master:local[*]}")
    private String sparkMaster;
    
    @Value("${app.spark.app.name:HealthicsAnalytics}")
    private String sparkAppName;
    
    private SparkSession getSparkSession() {
        SparkConf sparkConf = new SparkConf()
                .setAppName(sparkAppName)
                .setMaster(sparkMaster)
                .set("spark.sql.adaptive.enabled", "true")
                .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
                .set("spark.sql.adaptive.coalescePartitions.enabled", "true");

        return SparkSession.builder()
                .config(sparkConf)
                .getOrCreate();
    }

    /**
     * Analyze sample healthcare data using Spark
     * @return Analysis results for demonstration
     */
    public Map<String, Object> analyzeSampleHealthcareData() {
        logger.info("Starting sample healthcare data analysis with Spark");
        
        try {
            SparkSession spark = getSparkSession();

            // Create sample healthcare data
            List<String> sampleHealthcareRecords = Arrays.asList(
                "Patient ID: 1, Condition: diabetes, Treatment: insulin, Status: stable",
                "Patient ID: 2, Condition: hypertension, Treatment: medication, Status: improving",
                "Patient ID: 3, Condition: asthma, Treatment: inhaler, Status: stable",
                "Patient ID: 4, Condition: diabetes, Treatment: insulin, Status: critical",
                "Patient ID: 5, Condition: heart disease, Treatment: surgery, Status: recovering",
                "Patient ID: 6, Condition: hypertension, Treatment: diet, Status: improving",
                "Patient ID: 7, Condition: cancer, Treatment: chemotherapy, Status: stable",
                "Patient ID: 8, Condition: diabetes, Treatment: diet, Status: improving",
                "Patient ID: 9, Condition: asthma, Treatment: medication, Status: stable",
                "Patient ID: 10, Condition: migraine, Treatment: medication, Status: improving"
            );            // Create Spark RDD
            JavaSparkContext jsc = null;
            try {
                jsc = new JavaSparkContext(spark.sparkContext());
                JavaRDD<String> healthcareRDD = jsc.parallelize(sampleHealthcareRecords);

            // Convert to DataFrame
            Dataset<Row> healthcareDF = spark.createDataFrame(
                    healthcareRDD.map(record -> org.apache.spark.sql.RowFactory.create(record)),
                    org.apache.spark.sql.types.DataTypes.createStructType(Arrays.asList(
                            org.apache.spark.sql.types.DataTypes.createStructField("record", 
                                    org.apache.spark.sql.types.DataTypes.StringType, false)
                    ))
            );

            // Perform analytics
            Map<String, Object> analytics = performHealthcareAnalytics(healthcareDF);
            
            // Add metadata
            analytics.put("status", "success");
            analytics.put("timestamp", LocalDateTime.now().toString());            analytics.put("totalRecords", sampleHealthcareRecords.size());
            analytics.put("analyticsEngine", "Apache Spark " + spark.version());
            
            logger.info("Successfully completed sample healthcare data analysis");
            return analytics;
            
            } finally {
                if (jsc != null) {
                    jsc.close();
                }
                spark.stop();
            }

        } catch (Exception e) {
            logger.error("Error in sample healthcare data analysis", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Analytics failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }

    /**
     * Perform machine learning analysis on healthcare trends
     * @return ML analysis results
     */
    public Map<String, Object> performMachineLearningAnalysis() {
        logger.info("Starting machine learning analysis on healthcare data");
        
        try {
            SparkSession spark = getSparkSession();

            // Sample data for ML analysis
            List<Map<String, Object>> patientData = Arrays.asList(
                Map.of("age", 45, "bloodPressure", 140, "cholesterol", 200, "riskScore", 0.7),
                Map.of("age", 32, "bloodPressure", 120, "cholesterol", 180, "riskScore", 0.3),
                Map.of("age", 58, "bloodPressure", 160, "cholesterol", 250, "riskScore", 0.9),
                Map.of("age", 29, "bloodPressure", 110, "cholesterol", 160, "riskScore", 0.2),
                Map.of("age", 51, "bloodPressure", 145, "cholesterol", 220, "riskScore", 0.8),
                Map.of("age", 38, "bloodPressure", 125, "cholesterol", 190, "riskScore", 0.4),
                Map.of("age", 62, "bloodPressure", 155, "cholesterol", 240, "riskScore", 0.85),
                Map.of("age", 27, "bloodPressure", 115, "cholesterol", 170, "riskScore", 0.25)
            );

            // Calculate risk statistics
            double avgAge = patientData.stream()
                    .mapToInt(p -> (Integer) p.get("age"))
                    .average()
                    .orElse(0.0);

            double avgBloodPressure = patientData.stream()
                    .mapToInt(p -> (Integer) p.get("bloodPressure"))
                    .average()
                    .orElse(0.0);

            double avgCholesterol = patientData.stream()
                    .mapToInt(p -> (Integer) p.get("cholesterol"))
                    .average()
                    .orElse(0.0);

            double avgRiskScore = patientData.stream()
                    .mapToDouble(p -> (Double) p.get("riskScore"))
                    .average()
                    .orElse(0.0);

            // Risk categorization
            long highRiskPatients = patientData.stream()
                    .mapToDouble(p -> (Double) p.get("riskScore"))
                    .filter(risk -> risk > 0.7)
                    .count();

            long mediumRiskPatients = patientData.stream()
                    .mapToDouble(p -> (Double) p.get("riskScore"))
                    .filter(risk -> risk >= 0.4 && risk <= 0.7)
                    .count();

            long lowRiskPatients = patientData.stream()
                    .mapToDouble(p -> (Double) p.get("riskScore"))
                    .filter(risk -> risk < 0.4)
                    .count();

            Map<String, Object> mlResults = new HashMap<>();
            mlResults.put("status", "success");
            mlResults.put("timestamp", LocalDateTime.now().toString());
            mlResults.put("algorithm", "Statistical Risk Analysis");
            mlResults.put("patientCount", patientData.size());
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("averageAge", Math.round(avgAge * 100.0) / 100.0);
            statistics.put("averageBloodPressure", Math.round(avgBloodPressure * 100.0) / 100.0);
            statistics.put("averageCholesterol", Math.round(avgCholesterol * 100.0) / 100.0);
            statistics.put("averageRiskScore", Math.round(avgRiskScore * 100.0) / 100.0);
            
            Map<String, Object> riskDistribution = new HashMap<>();
            riskDistribution.put("highRisk", highRiskPatients);
            riskDistribution.put("mediumRisk", mediumRiskPatients);
            riskDistribution.put("lowRisk", lowRiskPatients);
            
            mlResults.put("statistics", statistics);
            mlResults.put("riskDistribution", riskDistribution);
            mlResults.put("recommendations", generateRecommendations(avgRiskScore));

            spark.stop();
            
            logger.info("Successfully completed machine learning analysis");
            return mlResults;

        } catch (Exception e) {
            logger.error("Error in machine learning analysis", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "ML analysis failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }

    /**
     * Generate predictive analytics for healthcare trends
     * @return Predictive analytics results
     */
    public Map<String, Object> generatePredictiveAnalytics() {
        logger.info("Starting predictive analytics for healthcare trends");
        
        try {
            SparkSession spark = getSparkSession();

            // Historical data simulation
            Map<String, List<Integer>> monthlyData = new HashMap<>();
            monthlyData.put("diabetes", Arrays.asList(45, 48, 52, 47, 51, 55, 58, 56, 60, 62, 65, 68));
            monthlyData.put("hypertension", Arrays.asList(38, 42, 39, 44, 46, 48, 45, 50, 52, 49, 53, 55));
            monthlyData.put("asthma", Arrays.asList(22, 25, 28, 24, 27, 30, 26, 29, 32, 28, 31, 34));
            monthlyData.put("heart_disease", Arrays.asList(15, 18, 16, 19, 21, 17, 20, 23, 19, 22, 25, 24));

            // Simple trend prediction (linear growth)
            Map<String, Object> predictions = new HashMap<>();
            
            for (Map.Entry<String, List<Integer>> entry : monthlyData.entrySet()) {
                String condition = entry.getKey();
                List<Integer> values = entry.getValue();
                
                // Calculate trend
                double trend = calculateTrend(values);
                int lastValue = values.get(values.size() - 1);
                int predicted = (int) Math.round(lastValue + trend);
                
                Map<String, Object> conditionPrediction = new HashMap<>();
                conditionPrediction.put("current", lastValue);
                conditionPrediction.put("predicted", predicted);
                conditionPrediction.put("trend", trend > 0 ? "increasing" : "decreasing");
                conditionPrediction.put("changePercentage", Math.round((trend / lastValue) * 100.0 * 100.0) / 100.0);
                
                predictions.put(condition, conditionPrediction);
            }

            Map<String, Object> results = new HashMap<>();
            results.put("status", "success");
            results.put("timestamp", LocalDateTime.now().toString());
            results.put("predictionPeriod", "Next Month");
            results.put("predictions", predictions);
            results.put("algorithm", "Linear Trend Analysis");
            results.put("confidence", 0.75);

            spark.stop();
            
            logger.info("Successfully completed predictive analytics");
            return results;

        } catch (Exception e) {
            logger.error("Error in predictive analytics", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Predictive analytics failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }

    // Helper methods
    
    private Map<String, Object> performHealthcareAnalytics(Dataset<Row> healthcareDF) {
        Map<String, Object> analytics = new HashMap<>();

        // Medical conditions analysis
        String[] conditions = {"diabetes", "hypertension", "asthma", "heart disease", "cancer", "migraine"};
        Map<String, Long> conditionCounts = new HashMap<>();

        for (String condition : conditions) {
            long count = healthcareDF
                    .filter(functions.lower(functions.col("record")).contains(condition.toLowerCase()))
                    .count();
            conditionCounts.put(condition, count);
        }

        // Treatment analysis
        String[] treatments = {"insulin", "medication", "surgery", "diet", "chemotherapy", "inhaler"};
        Map<String, Long> treatmentCounts = new HashMap<>();

        for (String treatment : treatments) {
            long count = healthcareDF
                    .filter(functions.lower(functions.col("record")).contains(treatment.toLowerCase()))
                    .count();
            treatmentCounts.put(treatment, count);
        }

        // Status analysis
        String[] statuses = {"stable", "improving", "critical", "recovering"};
        Map<String, Long> statusCounts = new HashMap<>();

        for (String status : statuses) {
            long count = healthcareDF
                    .filter(functions.lower(functions.col("record")).contains(status.toLowerCase()))
                    .count();
            statusCounts.put(status, count);
        }

        analytics.put("conditionDistribution", conditionCounts);
        analytics.put("treatmentDistribution", treatmentCounts);
        analytics.put("statusDistribution", statusCounts);

        return analytics;
    }

    private List<String> generateRecommendations(double avgRiskScore) {
        List<String> recommendations = new ArrayList<>();
        
        if (avgRiskScore > 0.7) {
            recommendations.add("Implement immediate intervention protocols for high-risk patients");
            recommendations.add("Increase monitoring frequency for critical cases");
            recommendations.add("Consider preventive care programs");
        } else if (avgRiskScore > 0.4) {
            recommendations.add("Maintain regular monitoring schedule");
            recommendations.add("Focus on lifestyle modification programs");
            recommendations.add("Implement early warning systems");
        } else {
            recommendations.add("Continue standard care protocols");
            recommendations.add("Focus on preventive health education");
            recommendations.add("Maintain current monitoring intervals");
        }
        
        return recommendations;
    }

    private double calculateTrend(List<Integer> values) {
        if (values.size() < 2) return 0.0;
        
        int n = values.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values.get(i);
            sumXY += i * values.get(i);
            sumX2 += i * i;
        }
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }
}
