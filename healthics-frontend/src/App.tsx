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

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // You can customize your color palette here
  },
});

function App() {
  return (
    <ErrorBoundary>
      <MantineProvider theme={theme} defaultColorScheme="light">
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
                  <Route path="/admin/patients/:patientId/documents" element={<AdminPatientDocumentsPage />} />
                  <Route path="/admin/documents/:documentId" element={<AdminDocumentDetailPage />} />
                </Route>
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default App;