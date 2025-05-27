import { useState } from 'react';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack, 
  Checkbox, 
  Alert,
  TextInput,
  Badge,
  Box,
  Grid,
  Card,
  Tabs,
  ScrollArea,
  ActionIcon,
  Avatar,
  Divider
} from '@mantine/core';
import { 
  IconStethoscope, 
  IconMessageCircle, 
  IconSend, 
  IconAlertTriangle,
  IconRobot,
  IconUser,
  IconRefresh,
  IconHeartbeat
} from '@tabler/icons-react';
import PageHeader from '../components/PageHeader';
import apiClient from '../api/apiClient';

interface PredictionResult {
  primary_prediction: {
    disease: string;
    confidence: number;
  };
  differential_diagnoses?: Array<{
    disease: string;
    probability: number;
  }>;
  disclaimer: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
}

interface SymptomOption {
  value: string;
  label: string;
}

// Minimal version of the Health Advisor page
const MinimalHealthAdvisorPage = () => {
  const [activeTab, setActiveTab] = useState<string>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', content: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  // Simple function to check symptoms
  const checkSymptoms = async () => {
    try {
      if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom');
        return;
      }
      
      setIsLoading(true);
      const response = await apiClient.post('/health/predict-disease', { 
        symptoms: selectedSymptoms 
      });
      
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error predicting disease:', error);
      alert('Failed to predict disease. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple function to send a chat message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user'
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    const message = newMessage;
    setNewMessage('');
    
    try {
      const response = await apiClient.post('/health/chat', { message });
      
      // Add bot response to chat
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        sender: 'bot'
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your message.",
        sender: 'bot'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Symptom options for selection
  const symptomOptions: SymptomOption[] = [
    { value: 'fever', label: 'Fever' },
    { value: 'cough', label: 'Cough' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'headache', label: 'Headache' },
    { value: 'shortness_of_breath', label: 'Shortness of Breath' },
    { value: 'sore_throat', label: 'Sore Throat' }
  ];

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    if (checked) {
      setSelectedSymptoms(prev => [...prev, symptom]);
    } else {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    }
  };

  const resetSymptoms = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
  };

  return (
    <Container size="xl" py="xl">      <PageHeader
        title="Health Advisor"
      />

      <Text size="lg" c="dimmed" mb="xl" ta="center">
        Get insights about your symptoms and chat with our AI health assistant
      </Text>

      <Paper 
        p="xl" 
        radius="xl" 
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'symptoms')} variant="pills" radius="xl">
          <Tabs.List mb="xl">
            <Tabs.Tab 
              value="symptoms" 
              leftSection={<IconHeartbeat size={16} />}
            >
              Symptom Checker
            </Tabs.Tab>
            <Tabs.Tab 
              value="chat" 
              leftSection={<IconMessageCircle size={16} />}
            >
              Health Chat Assistant
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="symptoms">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card 
                  p="xl" 
                  radius="xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}                >
                  <Title order={3} mb="md" c="medicalBlue">
                    Check Your Symptoms
                  </Title>
                  <Text size="sm" c="dimmed" mb="xl">
                    Select the symptoms you're experiencing to get a preliminary assessment.
                  </Text>
                  
                  <Stack gap="md">
                    {symptomOptions.map(symptom => (
                      <Checkbox
                        key={symptom.value}
                        label={symptom.label}
                        checked={selectedSymptoms.includes(symptom.value)}
                        onChange={(event) => 
                          handleSymptomChange(symptom.value, event.currentTarget.checked)
                        }                        size="md"
                        color="medicalBlue"
                      />
                    ))}
                  </Stack>
                  
                  <Group mt="xl">
                    <Button 
                      onClick={checkSymptoms}
                      loading={isLoading}
                      leftSection={<IconStethoscope size={16} />}                      variant="gradient"
                      gradient={{ from: 'medicalBlue', to: 'blue' }}
                      size="md"
                      radius="xl"
                    >
                      Check Symptoms
                    </Button>
                    <Button 
                      onClick={resetSymptoms}
                      leftSection={<IconRefresh size={16} />}
                      variant="light"
                      color="gray"
                      size="md"
                      radius="xl"
                    >
                      Reset
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                {prediction ? (
                  <Card 
                    p="xl" 
                    radius="xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >                    <Title order={3} mb="md" c="medicalBlue">
                      Assessment Results
                    </Title>
                    
                    <Box 
                      p="md" 
                      mb="md"
                      style={{
                        background: 'rgba(20, 184, 166, 0.1)',
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        borderRadius: '12px'
                      }}
                    >
                      <Text fw={600} mb="xs">Primary Assessment:</Text>
                      <Group gap="xs" mb="sm">                        <Badge 
                          variant="gradient" 
                          gradient={{ from: 'medicalBlue', to: 'blue' }}
                          size="lg"
                        >
                          {prediction.primary_prediction.disease}
                        </Badge>
                        <Badge variant="light" color="gray" size="lg">
                          Confidence: {Math.round(prediction.primary_prediction.confidence * 100)}%
                        </Badge>
                      </Group>
                      
                      {prediction.differential_diagnoses && prediction.differential_diagnoses.length > 0 && (
                        <Box mt="md">
                          <Text fw={600} mb="xs">Other Possibilities:</Text>
                          <Group gap="xs">
                            {prediction.differential_diagnoses.map((diagnosis, index) => (                              <Badge 
                                key={index}
                                variant="light" 
                                color="medicalBlue"
                                size="md"
                              >
                                {diagnosis.disease} ({Math.round(diagnosis.probability * 100)}%)
                              </Badge>
                            ))}
                          </Group>
                        </Box>
                      )}
                    </Box>
                    
                    <Alert 
                      icon={<IconAlertTriangle size={16} />}
                      title="Important Disclaimer"
                      color="yellow"
                      radius="md"
                      variant="light"
                      mb="md"
                    >
                      <Text size="sm">{prediction.disclaimer}</Text>
                    </Alert>
                    
                    <Button 
                      onClick={() => setActiveTab('chat')}
                      leftSection={<IconMessageCircle size={16} />}                      variant="outline"
                      color="medicalBlue"
                      size="md"
                      radius="xl"
                      fullWidth
                    >
                      Discuss with Health Assistant
                    </Button>
                  </Card>
                ) : (
                  <Card 
                    p="xl" 
                    radius="xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      textAlign: 'center'
                    }}
                  >
                    <IconStethoscope size={48} color="var(--mantine-color-gray-4)" />
                    <Text c="dimmed" mt="md">
                      Select symptoms and click "Check Symptoms" to get an assessment
                    </Text>
                  </Card>
                )}
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="chat">
            <Card 
              radius="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden'
              }}
            >
              <Card.Section 
                p="xl" 
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.1))',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Group>                  <Avatar color="medicalBlue" radius="xl">
                    <IconRobot size={20} />
                  </Avatar>
                  <Box>
                    <Title order={3} c="medicalBlue">Health Assistant Chat</Title>
                    <Text size="sm" c="dimmed">
                      Ask questions about symptoms, treatments, or general health information
                    </Text>
                  </Box>
                </Group>
              </Card.Section>
              
              <ScrollArea h={400} p="md">
                <Stack gap="md">
                  {chatMessages.map((message) => (
                    <Group 
                      key={message.id}
                      gap="sm"
                      style={{
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                      }}
                    >                      <Avatar 
                        color={message.sender === 'user' ? 'blue' : 'medicalBlue'}
                        radius="xl"
                        size="md"
                      >
                        {message.sender === 'user' ? <IconUser size={16} /> : <IconRobot size={16} />}
                      </Avatar>
                      <Paper 
                        p="md" 
                        radius="xl"
                        style={{
                          maxWidth: '80%',
                          background: message.sender === 'user' 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Text size="sm">{message.content}</Text>
                      </Paper>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>
              
              <Divider />
              
              <Group p="md" gap="sm">
                <TextInput
                  placeholder="Type your health question..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessage();
                    }
                  }}
                  style={{ flex: 1 }}
                  radius="xl"
                />
                <ActionIcon
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="lg"
                  radius="xl"                  variant="gradient"
                  gradient={{ from: 'medicalBlue', to: 'blue' }}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
              
              <Text size="xs" c="dimmed" p="md" pt={0} ta="center">
                This AI assistant provides general information only and is not a substitute for professional medical advice.
              </Text>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default MinimalHealthAdvisorPage;