import React from 'react';
import { Container, Paper, Title, Text, Alert, Button, Group } from '@mantine/core';
import { IconChartBar, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import PageHeader from '../components/PageHeader';

const SimpleBigDataAnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Analytics refreshed successfully');
    } catch (error) {
      setHasError(true);
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Auto-load on mount
    handleRefresh();
  }, []);

  return (
    <Container fluid>
      <PageHeader title="Big Data Analytics Dashboard" />
      
      <Paper p="md" style={{ marginTop: '1rem' }}>
        <Group mb="md">
          <IconChartBar size={24} />
          <Title order={3}>Healthcare Analytics Overview</Title>
        </Group>

        {hasError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Connection Error" 
            color="red" 
            mb="md"
          >
            Unable to connect to analytics backend. Using demo mode.
          </Alert>
        )}

        <Paper p="md" style={{ backgroundColor: '#f8f9fa', marginBottom: '1rem' }}>
          <Title order={4} mb="sm">System Status</Title>
          <Text>✅ Frontend: Active</Text>
          <Text>⚠️ Backend: Compilation issues detected</Text>
          <Text>🔄 Analytics: Demo mode enabled</Text>
          <Text>📊 Mock Data: Available</Text>
        </Paper>

        <Paper p="md" style={{ backgroundColor: '#e3f2fd', marginBottom: '1rem' }}>
          <Title order={4} mb="sm">Integration Features</Title>
          <Text>✅ Analytics page routing configured</Text>
          <Text>✅ Admin navigation updated with analytics link</Text>
          <Text>✅ Mock data service implemented</Text>
          <Text>✅ TypeScript interfaces defined</Text>
          <Text>✅ Error handling implemented</Text>
        </Paper>

        <Paper p="md" style={{ backgroundColor: '#f3e5f5' }}>
          <Title order={4} mb="sm">Next Steps</Title>
          <Text>1. Fix Java compilation issues in backend</Text>
          <Text>2. Test backend analytics endpoints</Text>
          <Text>3. Verify database connectivity</Text>
          <Text>4. Test with real patient data</Text>
          <Text>5. Performance optimization</Text>
        </Paper>

        <Group mt="lg">
          <Button 
            loading={isLoading}
            onClick={handleRefresh}
            leftSection={<IconRefresh size={16} />}
          >
            {isLoading ? 'Loading...' : 'Refresh Analytics'}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default SimpleBigDataAnalyticsPage;
