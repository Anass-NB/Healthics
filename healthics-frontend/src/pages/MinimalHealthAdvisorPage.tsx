import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import apiClient from '../api/apiClient';

// Minimal version of the Health Advisor page
const MinimalHealthAdvisorPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [chatMessages, setChatMessages] = useState([
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
      
      const response = await apiClient.post('/health/predict-disease', { 
        symptoms: selectedSymptoms 
      });
      
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error predicting disease:', error);
      alert('Failed to predict disease. Please try again.');
    }
  };

  // Simple function to send a chat message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages([
      ...chatMessages, 
      { id: Date.now().toString(), content: newMessage, sender: 'user' }
    ]);
    
    const message = newMessage;
    setNewMessage('');
    
    try {
      const response = await apiClient.post('/health/chat', { message });
      
      // Add bot response to chat
      setChatMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          content: response.data.response, 
          sender: 'bot' 
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      setChatMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          content: "Sorry, I couldn't process your message.", 
          sender: 'bot' 
        }
      ]);
    }
  };

  // Symptom options for selection
  const symptomOptions = [
    { value: 'fever', label: 'Fever' },
    { value: 'cough', label: 'Cough' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'headache', label: 'Headache' },
    { value: 'shortness_of_breath', label: 'Shortness of Breath' },
    { value: 'sore_throat', label: 'Sore Throat' }
  ];

  return (
    <div className="health-advisor-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Health Advisor</h1>
      <p>Get insights about your symptoms and chat with our AI health assistant</p>
      
      <div className="tabs" style={{ marginTop: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('symptoms')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'symptoms' ? '#f0f9ff' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
            fontWeight: activeTab === 'symptoms' ? 'bold' : 'normal'
          }}
        >
          Symptom Checker
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'chat' ? '#f0f9ff' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'chat' ? 'bold' : 'normal'
          }}
        >
          Health Chat Assistant
        </button>
      </div>
      
      {activeTab === 'symptoms' ? (
        <div className="symptoms-panel" style={{ marginTop: '20px' }}>
          <div className="symptom-selection" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Check Your Symptoms</h3>
            <p>Select the symptoms you're experiencing to get a preliminary assessment.</p>
            
            <div className="symptoms-list" style={{ marginTop: '15px' }}>
              {symptomOptions.map(symptom => (
                <label key={symptom.value} style={{ display: 'block', marginBottom: '8px' }}>
                  <input 
                    type="checkbox"
                    value={symptom.value}
                    checked={selectedSymptoms.includes(symptom.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSymptoms([...selectedSymptoms, symptom.value]);
                      } else {
                        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom.value));
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {symptom.label}
                </label>
              ))}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={checkSymptoms}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#228be6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Check Symptoms
              </button>
              <button 
                onClick={() => {
                  setSelectedSymptoms([]);
                  setPrediction(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
          </div>
          
          {prediction && (
            <div className="prediction-results" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Assessment Results</h3>
              
              <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px' }}>
                <p><strong>Primary Assessment:</strong></p>
                <div style={{ display: 'flex', marginTop: '8px' }}>
                  <span style={{ backgroundColor: '#e7f5ff', color: '#228be6', padding: '4px 8px', borderRadius: '4px', marginRight: '8px' }}>
                    {prediction.primary_prediction.disease}
                  </span>
                  <span style={{ backgroundColor: '#f1f3f5', padding: '4px 8px', borderRadius: '4px' }}>
                    Confidence: {Math.round(prediction.primary_prediction.confidence * 100)}%
                  </span>
                </div>
                
                {prediction.differential_diagnoses && prediction.differential_diagnoses.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>Other Possibilities:</strong></p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '8px' }}>
                      {prediction.differential_diagnoses.map((diagnosis, index) => (
                        <span 
                          key={index} 
                          style={{ 
                            backgroundColor: '#e3fafc', 
                            color: '#0c8599', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            marginRight: '8px',
                            marginBottom: '8px'
                          }}
                        >
                          {diagnosis.disease} ({Math.round(diagnosis.probability * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ backgroundColor: '#fff9db', padding: '15px', borderRadius: '8px', border: '1px solid #ffe066' }}>
                <p><strong>Important Disclaimer</strong></p>
                <p style={{ fontSize: '14px' }}>{prediction.disclaimer}</p>
              </div>
              
              <button 
                onClick={() => setActiveTab('chat')}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Discuss with Health Assistant
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-panel" style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '15px', backgroundColor: '#f1f8ff', borderBottom: '1px solid #ddd' }}>
            <h3>Health Assistant Chat</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Ask questions about symptoms, treatments, or general health information
            </p>
          </div>
          
          <div style={{ height: '400px', overflowY: 'auto', padding: '15px' }}>
            {chatMessages.map((message) => (
              <div 
                key={message.id} 
                style={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  marginBottom: '15px'
                }}
              >
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: message.sender === 'user' ? '#228be6' : '#15aabf',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: message.sender === 'user' ? '0' : '10px',
                    marginLeft: message.sender === 'user' ? '10px' : '0'
                  }}
                >
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div 
                  style={{
                    maxWidth: '80%',
                    padding: '10px 15px',
                    backgroundColor: message.sender === 'user' ? '#e7f5ff' : 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                >
                  <p style={{ margin: 0 }}>{message.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ padding: '15px', borderTop: '1px solid #ddd', display: 'flex' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your health question..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginRight: '10px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newMessage.trim()) {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{
                padding: '10px 15px',
                backgroundColor: '#228be6',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: newMessage.trim() ? 1 : 0.7
              }}
            >
              Send
            </button>
          </div>
          <div style={{ padding: '0 15px 15px', fontSize: '12px', color: '#888' }}>
            This AI assistant provides general information only and is not a substitute for professional medical advice.
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalHealthAdvisorPage;