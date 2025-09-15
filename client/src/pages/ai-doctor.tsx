import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  User,
  Stethoscope,
  Heart,
  Brain,
  MessageSquare,
  Sparkles,
  FileText,
  Upload
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { useHealthData } from '@/hooks/use-health-data';
import { useAuth } from '@/hooks/use-auth';
import { ThreeScene } from '@/components/ui/three-scene';

interface ChatMessage {
  id: string;
  role: 'user' | 'doctor';
  content: string;
  timestamp: Date;
  analyzed?: boolean;
}

interface HealthContext {
  symptoms?: string[];
  concerns?: string[];
  medications?: string[];
  currentVitals?: any;
}

export function AIDoctorPage() {
  const { t } = useTranslation();
  const { currentVitals, historicalData } = useHealthData();
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [healthContext, setHealthContext] = useState<HealthContext>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'doctor',
      content: `Hello! I'm Dr. AI, your personal 3D virtual health assistant. I'm here to help you with health questions, analyze your symptoms, and provide medical guidance. 

How are you feeling today? Is there anything specific about your health you'd like to discuss?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = selectedLanguage === 'en' ? 'en-US' : 'hi-IN';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      speechRecognition.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update health context when vitals change
    if (currentVitals) {
      setHealthContext(prev => ({
        ...prev,
        currentVitals
      }));
    }
  }, [currentVitals]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: currentMessage,
          healthContext: currentVitals ? {
            heartRate: currentVitals.heartRate,
            bloodPressureSystolic: currentVitals.bloodPressureSystolic,
            bloodPressureDiastolic: currentVitals.bloodPressureDiastolic,
            oxygenSaturation: currentVitals.oxygenSaturation,
            bodyTemperature: currentVitals.bodyTemperature
          } : undefined,
          userProfile: {
            age: userProfile?.age || 30,
            gender: userProfile?.gender || 'other',
            medicalHistory: userProfile?.medicalHistory
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const doctorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'doctor',
          content: data.response,
          timestamp: new Date(),
          analyzed: true
        };
        setMessages(prev => [...prev, doctorMessage]);
        
        // Speak the response if enabled
        if (isSpeaking) {
          speakText(data.response);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'doctor',
        content: "I apologize, but I'm having trouble processing your request right now. For immediate health concerns, please contact your healthcare provider or emergency services.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (speechRecognition.current && !isListening) {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition.current && isListening) {
      setIsListening(false);
      speechRecognition.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'en' ? 'en-US' : 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
    }
  };

  const quickQuestions = [
    "I'm feeling tired lately, what could be causing this?",
    "My blood pressure readings seem high, should I be concerned?",
    "What are some good exercises for heart health?",
    "I have a headache, what might help?",
    "Can you explain my recent vitals?",
    "What symptoms should I watch out for?"
  ];

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Doctor - 3D Virtual Consultation</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Doctor Avatar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Dr. AI - Virtual Doctor
                </CardTitle>
                <CardDescription>
                  Interactive 3D medical assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 3D Avatar Container */}
                <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ThreeScene />
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-blue-600">Analyzing...</p>
                      </div>
                    </div>
                  )}
                  {isListening && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-100 text-red-800 animate-pulse">
                        <Mic className="w-3 h-3 mr-1" />
                        Listening...
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Doctor Status */}
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Online & Ready
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Specialized in preventive care and health analysis
                  </p>
                </div>

                {/* Language & Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language:</span>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSpeaking}
                      className="flex-1"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                      {isSpeaking ? 'Mute' : 'Voice'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      disabled={!speechRecognition.current}
                      className="flex-1"
                    >
                      {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                      {isListening ? 'Stop' : 'Talk'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Medical Consultation
                </CardTitle>
                <CardDescription>
                  Discuss your health concerns with AI-powered medical assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Questions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Questions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4 bg-white">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'doctor' && (
                            <Stethoscope className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="w-4 h-4 text-blue-100 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                              {message.analyzed && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  <Brain className="w-2 h-2 mr-1" />
                                  AI Analyzed
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-500" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Health Context Display */}
                {currentVitals && (
                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      Current Health Context: HR {currentVitals.heartRate} BPM, 
                      BP {currentVitals.bloodPressureSystolic}/{currentVitals.bloodPressureDiastolic}, 
                      SpO₂ {currentVitals.oxygenSaturation}%, 
                      Temp {currentVitals.bodyTemperature}°F
                    </AlertDescription>
                  </Alert>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your health question or concern..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Medical Disclaimer:</strong> This AI assistant provides general health information 
                    and should not replace professional medical advice, diagnosis, or treatment. Always consult 
                    with qualified healthcare professionals for medical concerns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}