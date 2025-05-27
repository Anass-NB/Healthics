// Mock data for testing analytics integration when backend is not available
import { 
  AnalyticsResult, 
  PatientAnalysisResult, 
  MedicalConditionsResult, 
  HealthcareTrendsResult, 
  AnalyticsDashboard 
} from '../api/adminService';

export const mockAnalyticsResults: AnalyticsResult[] = [
  {
    id: '1',
    documentId: 101,
    patientId: 1,
    analysisType: 'SENTIMENT_ANALYSIS',
    results: {
      sentiment: 'positive',
      confidence: 0.87,
      keywords: ['healthy', 'improvement', 'stable'],
      medicalTerms: ['blood pressure', 'cholesterol', 'medication compliance']
    },
    timestamp: '2025-05-27T10:30:00Z',
    processingTimeMs: 1250
  },
  {
    id: '2',
    documentId: 102,
    patientId: 2,
    analysisType: 'MEDICAL_ENTITY_EXTRACTION',
    results: {
      entities: ['diabetes', 'insulin', 'glucose monitoring'],
      confidence: 0.92,
      medicalConcepts: ['type 2 diabetes', 'medication management', 'blood sugar control']
    },
    timestamp: '2025-05-27T11:15:00Z',
    processingTimeMs: 890
  },
  {
    id: '3',
    documentId: 103,
    patientId: 3,
    analysisType: 'RISK_ASSESSMENT',
    results: {
      riskLevel: 'medium',
      riskFactors: ['hypertension', 'family history', 'lifestyle'],
      recommendations: ['regular monitoring', 'diet modification', 'exercise program']
    },
    timestamp: '2025-05-27T12:00:00Z',
    processingTimeMs: 2100
  }
];

export const mockPatientAnalysis: PatientAnalysisResult = {
  patientId: 1,
  totalDocuments: 15,
  analysisResults: mockAnalyticsResults,
  healthMetrics: {
    overallHealthScore: 78,
    riskLevel: 'low',
    trendAnalysis: 'improving',
    keyInsights: [
      'Blood pressure trending downward',
      'Medication compliance excellent',
      'Regular exercise routine established'
    ]
  },
  documentAnalysis: {
    sentimentDistribution: {
      positive: 60,
      neutral: 30,
      negative: 10
    },
    medicalTermsFrequency: {
      'blood pressure': 12,
      'medication': 8,
      'exercise': 6,
      'diet': 5,
      'checkup': 4
    }
  }
};

export const mockMedicalConditions: MedicalConditionsResult = {
  totalConditions: 127,
  topConditions: [
    { condition: 'Hypertension', count: 45, percentage: 35.4 },
    { condition: 'Diabetes Type 2', count: 32, percentage: 25.2 },
    { condition: 'Hyperlipidemia', count: 28, percentage: 22.0 },
    { condition: 'Obesity', count: 22, percentage: 17.3 },
    { condition: 'Anxiety', count: 18, percentage: 14.2 },
    { condition: 'Depression', count: 15, percentage: 11.8 },
    { condition: 'Arthritis', count: 12, percentage: 9.4 },
    { condition: 'Asthma', count: 10, percentage: 7.9 }
  ],
  conditionsByCategory: {
    'Cardiovascular': 75,
    'Endocrine': 45,
    'Mental Health': 33,
    'Respiratory': 25,
    'Musculoskeletal': 20,
    'Other': 15
  },
  emergingTrends: [
    'Increased mental health conditions post-pandemic',
    'Rising obesity rates among young adults',
    'Better diabetes management with new technologies'
  ]
};

export const mockHealthcareTrends: HealthcareTrendsResult = {
  documentUploadTrends: {
    daily: [15, 18, 22, 19, 25, 28, 32],
    weekly: [120, 135, 145, 128, 167, 189, 201],
    monthly: [450, 523, 612, 578, 634, 689, 723]
  },
  categoryDistribution: {
    'Lab Results': 28,
    'Doctor Notes': 25,
    'Prescription Records': 20,
    'Imaging Reports': 15,
    'Vaccination Records': 8,
    'Other': 4
  },
  timeAnalysis: {
    peakUploadHours: [9, 10, 11, 14, 15, 16],
    slowestHours: [1, 2, 3, 4, 5, 6],
    weekendActivity: 65,
    weekdayActivity: 175
  },
  geographicDistribution: {
    'Urban': 70,
    'Suburban': 25,
    'Rural': 5
  }
};

export const mockAnalyticsDashboard: AnalyticsDashboard = {
  overview: {
    totalDocumentsProcessed: 1247,
    activeAnalysisJobs: 3,
    averageProcessingTime: 1456,
    systemHealth: 'healthy',
    lastUpdateTime: '2025-05-27T18:45:00Z'
  },
  recentAnalysis: mockAnalyticsResults.slice(0, 5),
  systemMetrics: {
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 34,
    networkThroughput: 125.5,
    activeConnections: 23,
    queueSize: 7
  },
  analyticsCapabilities: [
    'Sentiment Analysis',
    'Medical Entity Extraction',
    'Risk Assessment',
    'Trend Analysis',
    'Predictive Modeling',
    'Natural Language Processing'
  ],
  dataQuality: {
    completeness: 92,
    accuracy: 88,
    consistency: 95,
    timeliness: 89
  }
};

// Health analytics mock data
export const mockHealthAnalytics = {
  sampleAnalytics: {
    patientCount: 156,
    documentCount: 1247,
    avgProcessingTime: 1.45,
    systemHealth: 'Optimal'
  },
  mlAnalysis: {
    model: 'HealthPredict-v2.1',
    accuracy: 0.94,
    lastTrained: '2025-05-20T14:30:00Z',
    predictions: 342,
    confidence: 0.89
  },
  predictiveAnalytics: {
    riskPredictions: [
      { patientId: 1, riskLevel: 'low', confidence: 0.87 },
      { patientId: 2, riskLevel: 'medium', confidence: 0.92 },
      { patientId: 3, riskLevel: 'high', confidence: 0.78 }
    ],
    trends: ['Increased cardiovascular risk', 'Diabetes management improving'],
    recommendations: ['Increase preventive care', 'Focus on lifestyle interventions']
  },
  systemInfo: {
    version: '1.0.0',
    uptime: '15 days, 4 hours',
    lastRestart: '2025-05-12T08:00:00Z',
    environment: 'production',
    capabilities: mockAnalyticsDashboard.analyticsCapabilities
  }
};

export const isMockMode = () => {
  return process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;
};
