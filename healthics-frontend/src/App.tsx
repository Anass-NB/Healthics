import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RequirePatient from './components/RequirePatient';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import DocumentEditPage from './pages/DocumentEditPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPatientDocumentsPage from './pages/AdminPatientDocumentsPage';
import AdminDocumentDetailPage from './pages/AdminDocumentDetailPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminAllDocumentsPage from './pages/AdminAllDocumentsPage';
import MinimalHealthAdvisorPage from './pages/MinimalHealthAdvisorPage';
import SimpleBigDataAnalyticsPage from './pages/SimpleBigDataAnalyticsPage';

const theme = createTheme({
  primaryColor: 'medicalBlue',
  colors: {
    // Medical theme color palette (shades of blue and white)
    medicalBlue: [
      '#f0f8ff',
      '#e1efff',
      '#c2dfff',
      '#a3cfff',
      '#4a9eff',
      '#2b7ce8',
      '#1e5ac7',
      '#1847a6',
      '#133585',
      '#0e2464'
    ],
    blue: [
      '#ebf8ff',
      '#bee3f8',
      '#90cdf4',
      '#63b3ed',
      '#4299e1',
      '#3182ce',
      '#2b6cb0',
      '#2c5282',
      '#2a4365',
      '#1a365d'
    ],
    green: [
      '#f0fff4',
      '#c6f6d5',
      '#9ae6b4',
      '#68d391',
      '#48bb78',
      '#38a169',
      '#2f855a',
      '#276749',
      '#22543d',
      '#1a202c'
    ],
    // Custom gradient colors for backgrounds
    brand: [
      '#f7fafc',
      '#edf2f7',
      '#e2e8f0',
      '#cbd5e0',
      '#a0aec0',
      '#718096',
      '#4a5568',
      '#2d3748',
      '#1a202c',
      '#171923'
    ]
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>      <MantineProvider theme={theme} defaultColorScheme="light">
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <Notifications position="top-right" />
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Patient-only Routes */}
                  <Route element={<RequirePatient />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/documents/upload" element={<DocumentUploadPage />} />
                    <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
                    <Route path="/health-advisor" element={<MinimalHealthAdvisorPage />} />                
                  </Route>
                  
                  {/* Protected Routes for both Patient and Admin */}
                  <Route element={<RequireAuth />}>
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/documents/:id" element={<DocumentDetailPage />} />
                  </Route>
                    {/* Admin Routes */}
                  <Route element={<RequireAdmin />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/patients" element={<AdminPatientsPage />} />
                    <Route path="/admin/documents" element={<AdminAllDocumentsPage />} />
                    <Route path="/admin/analytics" element={<SimpleBigDataAnalyticsPage />} />
                    <Route path="/admin/patients/:patientId/documents" element={<AdminPatientDocumentsPage />} />
                    <Route path="/admin/documents/:documentId" element={<AdminDocumentDetailPage />} />
                  </Route>
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </div>
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default App;