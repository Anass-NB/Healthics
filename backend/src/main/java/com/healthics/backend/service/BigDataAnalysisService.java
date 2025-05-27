package com.healthics.backend.service;

import com.healthics.backend.model.Document;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.functions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BigDataAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(BigDataAnalysisService.class);

    @Value("${app.file.storage.location}")
    private String fileStorageLocation;

    @Value("${app.hadoop.temp.dir:./tmp/hadoop}")
    private String hadoopTempDir;
    
    @Value("${app.spark.master:local[*]}")
    private String sparkMaster;
    
    @Value("${app.spark.app.name:HealthicsAnalytics}")
    private String sparkAppName;
    
    @Autowired
    private DocumentService documentService;
    
    private SparkSession getSparkSession() {
        SparkConf sparkConf = new SparkConf()
                .setAppName(sparkAppName)
                .setMaster(sparkMaster)
                .set("spark.sql.adaptive.enabled", "true")
                .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer");

        return SparkSession.builder()
                .config(sparkConf)
                .getOrCreate();
    }    /**
     * Analyze patient documents using Hadoop and Spark
     * @param patientId The ID of the patient
     * @return Analysis results
     */
    public Map<String, Object> analyzePatientDocuments(Long patientId) {
        logger.info("Starting document analysis for patient ID: {}", patientId);
        
        try {
            // Get patient documents from database
            List<Document> patientDocuments = documentService.getDocumentsByPatientId(patientId);
            
            if (patientDocuments.isEmpty()) {
                logger.warn("No documents found for patient ID: {}", patientId);
                Map<String, Object> result = new HashMap<>();
                result.put("status", "success");
                result.put("message", "No documents found for analysis");
                result.put("documentCount", 0);
                return result;
            }

            // Initialize Spark
            SparkSession spark = getSparkSession();            // Convert documents to text content for analysis
            List<String> documentContents = new ArrayList<>();
            for (Document doc : patientDocuments) {
                // For now, we'll use fileName and description as content
                // In a real implementation, you'd extract text from actual files
                String content = (doc.getFileName() != null ? doc.getFileName() : "") + " " +
                               (doc.getDescription() != null ? doc.getDescription() : "");
                documentContents.add(content);
            }            // Create Spark RDD from document contents
            JavaSparkContext jsc = null;
            try {
                jsc = new JavaSparkContext(spark.sparkContext());
                JavaRDD<String> documentsRDD = jsc.parallelize(documentContents);

                // Convert to DataFrame for SQL operations
                Dataset<Row> documentsDF = spark.createDataFrame(
                        documentsRDD.map(content -> org.apache.spark.sql.RowFactory.create(content)),
                        org.apache.spark.sql.types.DataTypes.createStructType(Arrays.asList(
                                org.apache.spark.sql.types.DataTypes.createStructField("content", 
                                        org.apache.spark.sql.types.DataTypes.StringType, false)
                        ))
                );

            // Medical terms analysis
            Map<String, Long> medicalTermsCount = analyzeMedicalTerms(documentsDF);
            
            // Sentiment analysis
            Map<String, Object> sentimentAnalysis = performSentimentAnalysis(documentsDF);
            
            // Document category analysis
            Map<String, Long> categoryAnalysis = analyzeCategoriesForPatient(patientDocuments);            // Prepare comprehensive results
            Map<String, Object> results = new HashMap<>();
            results.put("status", "success");
            results.put("timestamp", LocalDateTime.now().toString());
            results.put("patientId", patientId);
            results.put("documentCount", patientDocuments.size());
            results.put("medicalTermsFrequency", medicalTermsCount);
            results.put("sentimentAnalysis", sentimentAnalysis);
            results.put("categoryDistribution", categoryAnalysis);
            results.put("analysisType", "patient_specific");

            logger.info("Successfully completed document analysis for patient ID: {}", patientId);
            return results;

            } finally {
                if (jsc != null) {
                    jsc.close();
                }
                // Clean up
                spark.stop();
            }

        } catch (Exception e) {
            logger.error("Error analyzing patient documents for ID: {}", patientId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Analysis failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }    /**
     * Extract common medical conditions from all patient documents
     * @return Top medical conditions mentioned across all patients
     */
    public Map<String, Object> extractMedicalConditions() {
        logger.info("Starting medical conditions extraction from all documents");
        
        try {
            // Get all documents from database
            List<Document> allDocuments = documentService.getAllDocuments();
            
            if (allDocuments.isEmpty()) {
                logger.warn("No documents found for medical conditions analysis");
                Map<String, Object> result = new HashMap<>();
                result.put("status", "success");
                result.put("message", "No documents found for analysis");
                return result;
            }

            // Initialize Spark
            SparkSession spark = getSparkSession();            // Convert documents to text content
            List<String> documentContents = allDocuments.stream()
                    .map(doc -> (doc.getFileName() != null ? doc.getFileName() : "") + " " +
                               (doc.getDescription() != null ? doc.getDescription() : ""))
                    .collect(Collectors.toList());            // Create Spark RDD
            JavaSparkContext jsc = null;
            try {
                jsc = new JavaSparkContext(spark.sparkContext());
                JavaRDD<String> documentsRDD = jsc.parallelize(documentContents);

            // Convert to DataFrame
            Dataset<Row> documentsDF = spark.createDataFrame(
                    documentsRDD.map(content -> org.apache.spark.sql.RowFactory.create(content)),
                    org.apache.spark.sql.types.DataTypes.createStructType(Arrays.asList(
                            org.apache.spark.sql.types.DataTypes.createStructField("content", 
                                    org.apache.spark.sql.types.DataTypes.StringType, false)
                    ))
            );

            // Expanded list of medical conditions to search for
            String[] conditions = {
                "diabetes", "hypertension", "asthma", "arthritis", "depression", "anxiety", 
                "obesity", "cancer", "heart disease", "migraine", "covid-19", "pneumonia",
                "bronchitis", "flu", "infection", "allergy", "dermatitis", "gastritis",
                "hepatitis", "nephritis", "appendicitis", "stroke", "fracture", "sprain"
            };

            Map<String, Long> conditionCounts = new HashMap<>();

            // Count occurrences of each condition using Spark SQL
            for (String condition : conditions) {
                long count = documentsDF
                        .filter(functions.lower(functions.col("content"))
                                .contains(condition.toLowerCase()))
                        .count();
                conditionCounts.put(condition, count);
            }            // Sort conditions by frequency
            Map<String, Long> sortedConditions = conditionCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue,
                            (e1, e2) -> e1,
                            LinkedHashMap::new
                    ));

            // Calculate statistics
            long totalMentions = conditionCounts.values().stream().mapToLong(Long::longValue).sum();
            double averageMentions = totalMentions / (double) conditions.length;

            // Prepare comprehensive results
            Map<String, Object> results = new HashMap<>();
            results.put("status", "success");
            results.put("timestamp", LocalDateTime.now().toString());
            results.put("totalDocuments", allDocuments.size());
            results.put("conditionCounts", sortedConditions);
            results.put("totalConditionMentions", totalMentions);            results.put("averageMentionsPerCondition", Math.round(averageMentions * 100.0) / 100.0);
            results.put("mostCommonCondition", sortedConditions.keySet().iterator().next());

            logger.info("Successfully completed medical conditions extraction");
            return results;

            } finally {
                if (jsc != null) {
                    jsc.close();
                }
                // Clean up
                spark.stop();
            }

        } catch (Exception e) {
            logger.error("Error extracting medical conditions", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Medical conditions extraction failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }

    /**
     * Perform healthcare trends analysis across all documents
     * @return Healthcare trends and patterns
     */
    public Map<String, Object> analyzeHealthcareTrends() {
        logger.info("Starting healthcare trends analysis");
        
        try {
            List<Document> allDocuments = documentService.getAllDocuments();
            
            if (allDocuments.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("status", "success");
                result.put("message", "No documents found for trends analysis");
                return result;
            }

            SparkSession spark = getSparkSession();

            // Analyze document categories distribution
            Map<String, Long> categoryDistribution = allDocuments.stream()
                    .collect(Collectors.groupingBy(
                            doc -> doc.getCategory() != null ? doc.getCategory().getName() : "Uncategorized",
                            Collectors.counting()
                    ));

            // Analyze upload patterns by month
            Map<String, Long> uploadPatterns = allDocuments.stream()
                    .collect(Collectors.groupingBy(
                            doc -> doc.getUploadDate() != null ? 
                                   doc.getUploadDate().toString().substring(0, 7) : "Unknown", // YYYY-MM format
                            Collectors.counting()
                    ));

            // Create comprehensive analysis
            Map<String, Object> results = new HashMap<>();
            results.put("status", "success");
            results.put("timestamp", LocalDateTime.now().toString());
            results.put("totalDocuments", allDocuments.size());
            results.put("categoryDistribution", categoryDistribution);
            results.put("uploadPatterns", uploadPatterns);
            results.put("analysisType", "healthcare_trends");

            spark.stop();
            
            logger.info("Successfully completed healthcare trends analysis");
            return results;

        } catch (Exception e) {
            logger.error("Error analyzing healthcare trends", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Healthcare trends analysis failed: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            return errorResponse;
        }
    }

    // Helper methods
    
    private Map<String, Long> analyzeMedicalTerms(Dataset<Row> documentsDF) {
        String[] medicalTerms = {
            "fever", "pain", "treatment", "medication", "diagnosis", "therapy", "surgery",
            "prescription", "symptoms", "recovery", "consultation", "examination", "test",
            "blood", "pressure", "heart", "lung", "kidney", "liver", "brain"
        };
        
        Map<String, Long> termCounts = new HashMap<>();
        
        for (String term : medicalTerms) {
            long count = documentsDF
                    .filter(functions.lower(functions.col("content")).contains(term.toLowerCase()))
                    .count();
            termCounts.put(term, count);
        }
        
        return termCounts;
    }
    
    private Map<String, Object> performSentimentAnalysis(Dataset<Row> documentsDF) {
        String[] positiveTerms = {
            "improvement", "better", "good", "positive", "recovery", "healing", "progress",
            "successful", "effective", "relief", "stable", "normal", "healthy"
        };
        
        String[] negativeTerms = {
            "worse", "pain", "negative", "complication", "issue", "problem", "severe",
            "critical", "emergency", "deterioration", "infection", "inflammation"
        };
        
        long positiveCount = 0;
        long negativeCount = 0;
        
        for (String term : positiveTerms) {
            positiveCount += documentsDF
                    .filter(functions.lower(functions.col("content")).contains(term.toLowerCase()))
                    .count();
        }
        
        for (String term : negativeTerms) {
            negativeCount += documentsDF
                    .filter(functions.lower(functions.col("content")).contains(term.toLowerCase()))
                    .count();
        }
        
        String overallSentiment;
        double sentimentScore;
        
        if (positiveCount + negativeCount == 0) {
            overallSentiment = "Neutral";
            sentimentScore = 0.0;
        } else {
            sentimentScore = (double) positiveCount / (positiveCount + negativeCount);
            if (sentimentScore > 0.6) {
                overallSentiment = "Positive";
            } else if (sentimentScore < 0.4) {
                overallSentiment = "Negative";
            } else {
                overallSentiment = "Neutral";
            }
        }
        
        Map<String, Object> sentiment = new HashMap<>();
        sentiment.put("overall", overallSentiment);
        sentiment.put("score", Math.round(sentimentScore * 100.0) / 100.0);
        sentiment.put("positiveTermsCount", positiveCount);
        sentiment.put("negativeTermsCount", negativeCount);
        
        return sentiment;
    }
    
    private Map<String, Long> analyzeCategoriesForPatient(List<Document> documents) {
        return documents.stream()
                .collect(Collectors.groupingBy(
                        doc -> doc.getCategory() != null ? doc.getCategory().getName() : "Uncategorized",
                        Collectors.counting()
                ));
    }
}