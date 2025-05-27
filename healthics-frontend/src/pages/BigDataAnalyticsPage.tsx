import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Alert,
  LoadingOverlay,
  Progress,
  RingProgress,
  SimpleGrid,
  Tabs,
  ActionIcon,
  Modal,
  Textarea,
  NumberInput,
  Select,
  Center,
  ThemeIcon,
  Box,
  Accordion,
  Table,
  ScrollArea,
  Divider
} from '@mantine/core';
import {
  IconAnalyze,
  IconBrain,
  IconChartBar,
  IconChartPie,
  IconDatabase,
  IconRefresh,
  IconDownload,
  IconAlertCircle,
  IconCheck,
  IconFileAnalytics,
  IconTrendingUp,
  IconReport,
  IconActivityHeartbeat,
  IconStethoscope,
  IconMedicalCross,
  IconChartDots,
  IconInfoCircle
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import PageHeader from '../components/PageHeader';
import adminService, {
  AnalyticsDashboard,
  PatientAnalysisResult,
  MedicalConditionsResult,
  HealthcareTrendsResult,
  AnalyticsResult
} from '../api/adminService';

const BigDataAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);
  const [analyticsDashboard, setAnalyticsDashboard] = useState<AnalyticsDashboard | null>(null);
  const [healthAnalytics, setHealthAnalytics] = useState<AnalyticsResult | null>(null);
  const [patientAnalysis, setPatientAnalysis] = useState<PatientAnalysisResult | null>(null);
  const [systemInfo, setSystemInfo] = useState<AnalyticsResult | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientAnalysisModal, setPatientAnalysisModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverviewData();
    loadSystemInfo();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardData, healthData] = await Promise.all([
        adminService.getAnalyticsDashboard(),
        adminService.getHealthAnalyticsDashboard()
      ]);
      
      setAnalyticsDashboard(dashboardData);
      setHealthAnalytics(healthData);
    } catch (error: any) {
      console.error('Error loading analytics overview:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
      showNotification({
        title: 'Error',
        message: 'Failed to load analytics data',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const info = await adminService.getAnalyticsSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const runPatientAnalysis = async () => {
    if (!selectedPatientId) {
      showNotification({
        title: 'Error',
        message: 'Please enter a patient ID',
        color: 'red'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.analyzePatientDocuments(selectedPatientId);
      setPatientAnalysis(result);
      setPatientAnalysisModal(true);
      
      showNotification({
        title: 'Success',
        message: 'Patient analysis completed successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error: any) {
      console.error('Error analyzing patient:', error);
      showNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to analyze patient documents',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async (type: string) => {
    try {
      setLoading(true);
      
      switch (type) {
        case 'overview':
          await loadOverviewData();
          break;
        case 'conditions':
          const conditions = await adminService.extractMedicalConditions();
          if (analyticsDashboard) {
            setAnalyticsDashboard({
              ...analyticsDashboard,
              medicalConditions: conditions
            });
          }
          break;
        case 'trends':
          const trends = await adminService.analyzeHealthcareTrends();
          if (analyticsDashboard) {
            setAnalyticsDashboard({
              ...analyticsDashboard,
              healthcareTrends: trends
            });
          }
          break;
        default:
          await loadOverviewData();
      }
      
      showNotification({
        title: 'Success',
        message: 'Analytics data refreshed successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error: any) {
      console.error('Error refreshing analytics:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to refresh analytics data',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!analyticsDashboard) return null;

    const { medicalConditions, healthcareTrends } = analyticsDashboard;

    return (
      <Stack spacing="lg">
        {/* System Status Cards */}
        <SimpleGrid cols={4} spacing="md">
          <Card withBorder>
            <Group>
              <ThemeIcon color="blue" size="xl" radius="md">
                <IconDatabase size={28} />
              </ThemeIcon>
              <div>
                <Text size="sm" color="dimmed">Total Documents</Text>
                <Text size="xl" weight={700}>
                  {healthcareTrends?.totalDocuments || 0}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <ThemeIcon color="green" size="xl" radius="md">
                <IconMedicalCross size={28} />
              </ThemeIcon>
              <div>
                <Text size="sm" color="dimmed">Medical Conditions</Text>
                <Text size="xl" weight={700}>
                  {medicalConditions?.conditionCounts ? 
                    Object.keys(medicalConditions.conditionCounts).length : 0}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <ThemeIcon color="orange" size="xl" radius="md">
                <IconTrendingUp size={28} />
              </ThemeIcon>
              <div>
                <Text size="sm" color="dimmed">Total Mentions</Text>
                <Text size="xl" weight={700}>
                  {medicalConditions?.totalConditionMentions || 0}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <ThemeIcon color="grape" size="xl" radius="md">
                <IconBrain size={28} />
              </ThemeIcon>
              <div>
                <Text size="sm" color="dimmed">Analytics Engine</Text>
                <Text size="sm" weight={600}>Apache Spark</Text>
                <Badge color="green" variant="filled" size="xs">Active</Badge>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Medical Conditions Overview */}
        {medicalConditions && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <Title order={4}>
                  <Group spacing="xs">
                    <IconStethoscope size={20} />
                    Medical Conditions Analysis
                  </Group>
                </Title>
                <ActionIcon onClick={() => refreshAnalytics('conditions')}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>
            </Card.Section>

            <Stack spacing="md" mt="md">
              <SimpleGrid cols={2} spacing="md">
                <div>
                  <Text size="sm" color="dimmed">Most Common Condition</Text>
                  <Text size="lg" weight={600}>
                    {medicalConditions.mostCommonCondition || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">Average Mentions</Text>
                  <Text size="lg" weight={600}>
                    {medicalConditions.averageMentionsPerCondition || 0}
                  </Text>
                </div>
              </SimpleGrid>

              {medicalConditions.conditionCounts && (
                <div>
                  <Text size="sm" color="dimmed" mb="xs">Top Conditions</Text>
                  <Stack spacing="xs">
                    {Object.entries(medicalConditions.conditionCounts)
                      .slice(0, 5)
                      .map(([condition, count]) => (
                        <Group key={condition} position="apart">
                          <Text size="sm" weight={500} tt="capitalize">{condition}</Text>
                          <Badge variant="filled" size="sm">{count}</Badge>
                        </Group>
                      ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </Card>
        )}

        {/* Healthcare Trends */}
        {healthcareTrends && (
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={4}>
                    <Group spacing="xs">
                      <IconChartPie size={20} />
                      Category Distribution
                    </Group>
                  </Title>
                </Card.Section>

                <Stack spacing="md" mt="md">
                  {healthcareTrends.categoryDistribution && 
                    Object.entries(healthcareTrends.categoryDistribution).map(([category, count]) => (
                      <div key={category}>
                        <Group position="apart" mb={5}>
                          <Text size="sm">{category}</Text>
                          <Text size="sm" weight={600}>{count}</Text>
                        </Group>
                        <Progress
                          value={(count / healthcareTrends.totalDocuments) * 100}
                          size="sm"
                          color="blue"
                        />
                      </div>
                    ))}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={6}>
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={4}>
                    <Group spacing="xs">
                      <IconChartBar size={20} />
                      Upload Patterns
                    </Group>
                  </Title>
                </Card.Section>

                <Stack spacing="md" mt="md">
                  {healthcareTrends.uploadPatterns && 
                    Object.entries(healthcareTrends.uploadPatterns)
                      .slice(0, 6)
                      .map(([period, count]) => (
                        <Group key={period} position="apart">
                          <Text size="sm">{period}</Text>
                          <Badge variant="outline">{count} documents</Badge>
                        </Group>
                      ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    );
  };

  const renderAnalyticsTab = () => (
    <Stack spacing="lg">
      {/* Patient Analysis Section */}
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={4}>
            <Group spacing="xs">
              <IconFileAnalytics size={20} />
              Patient Document Analysis
            </Group>
          </Title>
        </Card.Section>

        <Stack spacing="md" mt="md">
          <Text size="sm" color="dimmed">
            Analyze documents for a specific patient using big data analytics
          </Text>
          
          <Group>
            <NumberInput
              placeholder="Enter Patient ID"
              value={selectedPatientId || ''}
              onChange={(value) => setSelectedPatientId(value || null)}
              min={1}
              style={{ flex: 1 }}
            />
            <Button 
              onClick={runPatientAnalysis}
              loading={loading}
              leftIcon={<IconAnalyze size={16} />}
            >
              Analyze Patient
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Quick Analytics Actions */}
      <SimpleGrid cols={3} spacing="md">
        <Card withBorder>
          <Stack spacing="md">
            <Group>
              <ThemeIcon color="blue" size="lg">
                <IconMedicalCross size={20} />
              </ThemeIcon>
              <div>
                <Text weight={600}>Medical Conditions</Text>
                <Text size="sm" color="dimmed">Extract conditions from all documents</Text>
              </div>
            </Group>
            <Button 
              variant="light" 
              onClick={() => refreshAnalytics('conditions')}
              loading={loading}
            >
              Run Analysis
            </Button>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack spacing="md">
            <Group>
              <ThemeIcon color="green" size="lg">
                <IconTrendingUp size={20} />
              </ThemeIcon>
              <div>
                <Text weight={600}>Healthcare Trends</Text>
                <Text size="sm" color="dimmed">Analyze patterns and trends</Text>
              </div>
            </Group>
            <Button 
              variant="light" 
              onClick={() => refreshAnalytics('trends')}
              loading={loading}
            >
              Run Analysis
            </Button>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack spacing="md">
            <Group>
              <ThemeIcon color="orange" size="lg">
                <IconBrain size={20} />
              </ThemeIcon>
              <div>
                <Text weight={600}>ML Analysis</Text>
                <Text size="sm" color="dimmed">Machine learning insights</Text>
              </div>
            </Group>
            <Button 
              variant="light" 
              onClick={async () => {
                try {
                  setLoading(true);
                  await adminService.performMLAnalysis();
                  showNotification({
                    title: 'Success',
                    message: 'ML analysis completed',
                    color: 'green'
                  });
                } catch (error) {
                  showNotification({
                    title: 'Error',
                    message: 'ML analysis failed',
                    color: 'red'
                  });
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            >
              Run Analysis
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );

  const renderSystemTab = () => (
    <Stack spacing="lg">
      {systemInfo && (
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Title order={4}>
              <Group spacing="xs">
                <IconInfoCircle size={20} />
                Analytics System Information
              </Group>
            </Title>
          </Card.Section>

          <Stack spacing="md" mt="md">
            <Group position="apart">
              <Text>Status</Text>
              <Badge color={systemInfo.status === 'active' ? 'green' : 'red'}>
                {systemInfo.status}
              </Badge>
            </Group>

            {systemInfo.analyticsEngine && (
              <Group position="apart">
                <Text>Analytics Engine</Text>
                <Text weight={600}>{systemInfo.analyticsEngine}</Text>
              </Group>
            )}

            {systemInfo.bigDataFramework && (
              <Group position="apart">
                <Text>Big Data Framework</Text>
                <Text weight={600}>{systemInfo.bigDataFramework}</Text>
              </Group>
            )}

            {systemInfo.capabilities && (
              <div>
                <Text weight={600} mb="xs">Capabilities</Text>
                <Stack spacing="xs">
                  {systemInfo.capabilities.map((capability: string, index: number) => (
                    <Group key={index} spacing="xs">
                      <IconCheck size={16} color="green" />
                      <Text size="sm">{capability}</Text>
                    </Group>
                  ))}
                </Stack>
              </div>
            )}

            <Divider />

            <Group position="apart">
              <Text size="sm" color="dimmed">Last Updated</Text>
              <Text size="sm">
                {systemInfo.timestamp ? new Date(systemInfo.timestamp).toLocaleString() : 'N/A'}
              </Text>
            </Group>
          </Stack>
        </Card>
      )}

      <Card withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={4}>System Controls</Title>
        </Card.Section>

        <Stack spacing="md" mt="md">
          <Button 
            leftIcon={<IconRefresh size={16} />}
            onClick={() => refreshAnalytics('overview')}
            loading={loading}
          >
            Refresh All Analytics
          </Button>
          
          <Button 
            variant="outline"
            leftIcon={<IconDownload size={16} />}
            onClick={async () => {
              try {
                const dashboard = await adminService.getAnalyticsDashboard();
                const dataStr = JSON.stringify(dashboard, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              } catch (error) {
                showNotification({
                  title: 'Error',
                  message: 'Failed to export analytics data',
                  color: 'red'
                });
              }
            }}
          >
            Export Analytics Data
          </Button>
        </Stack>
      </Card>
    </Stack>
  );

  return (
    <Container size="xl">
      <PageHeader
        title="Big Data Analytics"
        description="Advanced healthcare analytics powered by Apache Spark and Hadoop"
      />

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <LoadingOverlay visible={loading} />
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>            <Tabs.Tab value="overview" leftSection={<IconChartDots size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="analytics" leftSection={<IconAnalyze size={16} />}>
              Analytics
            </Tabs.Tab>
            <Tabs.Tab value="system" leftSection={<IconDatabase size={16} />}>
              System
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {renderOverviewTab()}
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            {renderAnalyticsTab()}
          </Tabs.Panel>

          <Tabs.Panel value="system" pt="md">
            {renderSystemTab()}
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Patient Analysis Modal */}
      <Modal
        opened={patientAnalysisModal}
        onClose={() => setPatientAnalysisModal(false)}
        title="Patient Analysis Results"
        size="xl"
      >
        {patientAnalysis && (
          <Stack spacing="md">
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text size="sm" color="dimmed">Patient ID</Text>
                <Text weight={600}>{patientAnalysis.patientId}</Text>
              </div>
              <div>
                <Text size="sm" color="dimmed">Documents Analyzed</Text>
                <Text weight={600}>{patientAnalysis.documentCount}</Text>
              </div>
            </SimpleGrid>

            {patientAnalysis.sentimentAnalysis && (
              <Card withBorder>
                <Title order={5} mb="md">Sentiment Analysis</Title>
                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Text size="sm" color="dimmed">Overall Sentiment</Text>
                    <Badge 
                      color={
                        patientAnalysis.sentimentAnalysis.overall === 'Positive' ? 'green' :
                        patientAnalysis.sentimentAnalysis.overall === 'Negative' ? 'red' : 'gray'
                      }
                    >
                      {patientAnalysis.sentimentAnalysis.overall}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" color="dimmed">Sentiment Score</Text>
                    <Text weight={600}>{patientAnalysis.sentimentAnalysis.score}</Text>
                  </div>
                </SimpleGrid>
              </Card>
            )}

            {patientAnalysis.medicalTermsFrequency && (
              <Card withBorder>
                <Title order={5} mb="md">Medical Terms Frequency</Title>
                <ScrollArea style={{ height: 200 }}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Term</th>
                        <th>Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(patientAnalysis.medicalTermsFrequency)
                        .filter(([_, count]) => count > 0)
                        .map(([term, count]) => (
                          <tr key={term}>
                            <td>{term}</td>
                            <td>{count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </ScrollArea>
              </Card>
            )}

            {patientAnalysis.categoryDistribution && (
              <Card withBorder>
                <Title order={5} mb="md">Category Distribution</Title>
                <Stack spacing="xs">
                  {Object.entries(patientAnalysis.categoryDistribution).map(([category, count]) => (
                    <Group key={category} position="apart">
                      <Text size="sm">{category}</Text>
                      <Badge variant="outline">{count}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default BigDataAnalyticsPage;
