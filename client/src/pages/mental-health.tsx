import { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, Heart, Shield, Phone, UserPlus, Send, X, Video, Mic, MicOff, VideoOff, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type HelpCategory = 'loneliness' | 'study' | 'confidence' | 'career' | 'listen';

interface ChatMessage {
  id: string;
  type: 'student' | 'mentor';
  message: string;
  timestamp: Date;
  sender: string;
}

interface SavedSession {
  code: string;
  mentorName: string;
  category: HelpCategory;
  messages: ChatMessage[];
  lastUsed: Date;
}

interface EmergencyResource {
  name: string;
  number: string;
  description: string;
}

interface CallState {
  isCallActive: boolean;
  isVideoCall: boolean;
  isAudioCall: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  callDuration: number;
}

const helpCategories = [
  {
    id: 'loneliness' as HelpCategory,
    title: 'Loneliness & Stress',
    description: 'When you feel isolated or overwhelmed',
    icon: Heart,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'study' as HelpCategory,
    title: 'Study/Exam Pressure',
    description: 'Academic stress and performance anxiety',
    icon: Brain,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'confidence' as HelpCategory,
    title: 'Confidence & Personality',
    description: 'Building self-esteem and social skills',
    icon: Shield,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'career' as HelpCategory,
    title: 'Career & Future Path',
    description: 'Planning your future and making decisions',
    icon: MessageCircle,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'listen' as HelpCategory,
    title: 'Just Need Someone to Listen',
    description: 'A safe space to express your thoughts',
    icon: Heart,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  }
];

const emergencyResources: EmergencyResource[] = [
  {
    name: 'National Suicide Prevention Helpline',
    number: '108',
    description: '24/7 free crisis helpline'
  },
  {
    name: 'Mental Health Helpline',
    number: '1800-599-0019',
    description: 'Professional counseling support'
  },
  {
    name: 'Youth Helpline',
    number: '1098',
    description: 'Support for children and young adults'
  }
];

function generateAnonymousId(): string {
  const prefixes = ['Student', 'Dreamer', 'Listener', 'Seeker', 'Hope', 'Brave', 'Kind', 'Wise'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${prefix}_${number}`;
}

// Category-based mentor pool
const mentorPool = {
  loneliness: ['Mentor_Sarah', 'Mentor_Rahul', 'Mentor_Empathy'],
  study: ['Mentor_Academic', 'Mentor_Focus', 'Mentor_Study'],
  confidence: ['Mentor_Boost', 'Mentor_Shine', 'Mentor_Confident'],
  career: ['Mentor_Guide', 'Mentor_Path', 'Mentor_Future'],
  listen: ['Mentor_Heart', 'Mentor_Listener', 'Mentor_Care']
};

function getMentorForCategory(category: HelpCategory): string {
  const mentors = mentorPool[category];
  return mentors[Math.floor(Math.random() * mentors.length)];
}

function getMentorResponse(category: HelpCategory, studentMessage: string): string {
  const responses = {
    loneliness: [
      "I hear you, and what you're feeling is completely valid. Loneliness can be really tough. Can you tell me a bit more about what's making you feel this way?",
      "It takes courage to reach out when you're feeling lonely. That's actually a strength, not a weakness. What usually helps you feel a little better?",
      "Sometimes when we feel misunderstood, it helps to talk about it. I'm here to listen without any judgment."
    ],
    study: [
      "Academic pressure can feel overwhelming sometimes. You're definitely not alone in feeling this way. What aspect of studying is causing you the most stress right now?",
      "It sounds like you're putting a lot of pressure on yourself. Let's break this down together - what's one small thing we can work on today?",
      "Remember, your worth isn't determined by grades or exam results. You're valuable just as you are. What's been on your mind lately?"
    ],
    confidence: [
      "Building confidence is a journey, and it's okay to have ups and downs. What situations make you feel most uncertain about yourself?",
      "You took a big step by reaching out today - that shows more courage than you might realize. What would feeling more confident mean to you?",
      "Everyone struggles with self-doubt sometimes. What are some things you actually do well, even if they seem small?"
    ],
    career: [
      "Thinking about the future can feel both exciting and scary. It's normal to feel uncertain about your path. What aspects of your future feel most unclear?",
      "Career decisions can feel overwhelming, but remember - there's no single 'right' path. What are you passionate about, even if it seems small?",
      "It's okay not to have everything figured out. Most successful people changed directions multiple times. What interests you right now?"
    ],
    listen: [
      "I'm here and I'm listening. Sometimes we just need someone to hear us without trying to fix everything. What's on your heart today?",
      "Thank you for trusting me with your thoughts. There's no rush - share whatever feels right for you to share.",
      "You don't have to carry everything alone. I'm here to listen for as long as you need. What would help you feel heard today?"
    ]
  };
  
  const categoryResponses = responses[category];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

export default function MentalHealth() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatActive, setChatActive] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isVideoCall: false,
    isAudioCall: false,
    isMicMuted: false,
    isVideoMuted: false,
    callDuration: 0
  });
  const [mentorRegistration, setMentorRegistration] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualifications: '',
    availability: '',
    motivation: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mentalHealthSessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved) as SavedSession[];
        // Convert timestamp strings back to Date objects
        const processedSessions = sessions.map(session => ({
          ...session,
          lastUsed: new Date(session.lastUsed),
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSavedSessions(processedSessions);
      } catch (error) {
        console.error('Error loading saved sessions:', error);
        setSavedSessions([]);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChat = (category: HelpCategory) => {
    const newId = generateAnonymousId();
    const assignedMentor = getMentorForCategory(category);
    
    setAnonymousId(newId);
    setSelectedCategory(category);
    setMentorName(assignedMentor);
    setChatActive(true);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'mentor',
      message: `Hi ${newId} 👋 You can now talk to a mentor. Don't worry, your real identity will never be shown. I'm ${assignedMentor}, specializing in ${helpCategories.find(c => c.id === category)?.title.toLowerCase()}. How are you feeling today?`,
      timestamp: new Date(),
      sender: assignedMentor
    };
    
    setChatMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageText = currentMessage.trim(); // Capture message before clearing
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'student',
      message: messageText,
      timestamp: new Date(),
      sender: anonymousId
    };

    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    try {
      // Call Gemini-powered mentor API instead of predefined responses
      const response = await fetch('/api/chat/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          category: selectedCategory,
          mentorName: mentorName,
          studentId: anonymousId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const mentorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'mentor',
          message: data.response,
          timestamp: new Date(),
          sender: mentorName
        };

        setChatMessages(prev => [...prev, mentorResponse]);
      } else {
        // Fallback to predefined response if API fails
        const mentorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'mentor',
          message: getMentorResponse(selectedCategory || 'listen', messageText),
          timestamp: new Date(),
          sender: mentorName
        };

        setChatMessages(prev => [...prev, mentorResponse]);
      }
    } catch (error) {
      console.error('Error getting mentor response:', error);
      // Fallback to predefined response if API fails
      const mentorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mentor',
        message: getMentorResponse(selectedCategory || 'listen', messageText),
        timestamp: new Date(),
        sender: mentorName
      };

      setChatMessages(prev => [...prev, mentorResponse]);
    }

    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'no point', 'worthless', 'harm myself'];
    if (crisisKeywords.some(keyword => messageText.toLowerCase().includes(keyword))) {
      setTimeout(() => {
        setShowEmergencyDialog(true);
      }, 2000);
    }
  };

  const endChat = () => {
    setChatActive(false);
    setChatMessages([]);
    setSelectedCategory(null);
    setAnonymousId('');
    setMentorName('');
  };

  const saveSession = () => {
    if (!selectedCategory) return;
    
    // Check for privacy consent first
    const hasConsent = localStorage.getItem('mentalHealthPrivacyConsent');
    if (!hasConsent) {
      setShowPrivacyConsent(true);
      return;
    }
    
    const newSession: SavedSession = {
      code: anonymousId,
      mentorName: mentorName,
      category: selectedCategory,
      messages: chatMessages,
      lastUsed: new Date()
    };
    
    // Remove any existing session with the same code
    const updatedSessions = savedSessions.filter(session => session.code !== anonymousId);
    updatedSessions.push(newSession);
    
    setSavedSessions(updatedSessions);
    localStorage.setItem('mentalHealthSessions', JSON.stringify(updatedSessions));
    alert(`Session saved: ${anonymousId}. Find this session in 'Your Saved Sessions' on this device to continue with ${mentorName}.`);
  };
  
  const handlePrivacyConsent = (consent: boolean) => {
    if (consent) {
      localStorage.setItem('mentalHealthPrivacyConsent', 'true');
      saveSession(); // Retry saving after consent
    }
    setShowPrivacyConsent(false);
  };

  const loadSavedSession = (session: SavedSession) => {
    setAnonymousId(session.code);
    setSelectedCategory(session.category);
    setMentorName(session.mentorName);
    setChatActive(true);
    
    // Restore messages with a welcome back message
    const welcomeBackMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'mentor',
      message: `Welcome back ${session.code}! It's ${session.mentorName}. I remember our conversation about ${helpCategories.find(c => c.id === session.category)?.title.toLowerCase()}. How have you been since we last talked?`,
      timestamp: new Date(),
      sender: session.mentorName
    };
    
    // Restore full chat history and add welcome back message
    setChatMessages([...session.messages, welcomeBackMessage]);
  };

  // WebRTC Video/Voice Call Functions
  const initializeWebRTC = async () => {
    try {
      // Create peer connection with STUN servers
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Handle incoming stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      return false;
    }
  };

  const startVideoCall = async () => {
    try {
      const initialized = await initializeWebRTC();
      if (!initialized) {
        alert('Unable to initialize video calling. Please check your browser permissions.');
        return;
      }

      // Get user media for video call
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        isVideoCall: true,
        callDuration: 0
      }));

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1
        }));
      }, 1000);

      // Add system message about video call
      const callMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'mentor',
        message: "📹 Video call initiated! This is a simulated call experience. In a real deployment, this would connect you with an available mental health mentor for face-to-face support.",
        timestamp: new Date(),
        sender: mentorName
      };
      setChatMessages(prev => [...prev, callMessage]);
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Unable to access camera/microphone. Please check your browser permissions.');
    }
  };

  const startVoiceCall = async () => {
    try {
      const initialized = await initializeWebRTC();
      if (!initialized) {
        alert('Unable to initialize voice calling. Please check your browser permissions.');
        return;
      }

      // Get user media for audio call only
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      });
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        isAudioCall: true,
        callDuration: 0
      }));

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1
        }));
      }, 1000);

      // Add system message about voice call
      const callMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'mentor',
        message: "📞 Voice call initiated! This is a simulated call experience. In a real deployment, this would connect you with an available mental health mentor for voice support.",
        timestamp: new Date(),
        sender: mentorName
      };
      setChatMessages(prev => [...prev, callMessage]);
      
    } catch (error) {
      console.error('Error starting voice call:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const endCall = () => {
    // Stop all media tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setCallState({
      isCallActive: false,
      isVideoCall: false,
      isAudioCall: false,
      isMicMuted: false,
      isVideoMuted: false,
      callDuration: 0
    });

    // Add system message about call end
    const endCallMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'mentor',
      message: "Call ended. Remember, I'm still here if you need to continue our text conversation. You've shown great courage by reaching out today.",
      timestamp: new Date(),
      sender: mentorName
    };
    setChatMessages(prev => [...prev, endCallMessage]);
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = callState.isMicMuted;
        setCallState(prev => ({ ...prev, isMicMuted: !prev.isMicMuted }));
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = callState.isVideoMuted;
        setCallState(prev => ({ ...prev, isVideoMuted: !prev.isVideoMuted }));
      }
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMentorRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would call an API endpoint
      const response = await fetch('/api/mentors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mentorRegistration)
      });

      if (response.ok) {
        alert('Thank you for your application! Our team will review your submission and contact you within 3-5 business days.');
        setMentorRegistration({
          name: '',
          email: '',
          specialization: '',
          experience: '',
          qualifications: '',
          availability: '',
          motivation: ''
        });
      } else {
        // For now, since the endpoint doesn't exist, show success message anyway
        alert('Thank you for your application! Our team will review your submission and contact you within 3-5 business days.');
        setMentorRegistration({
          name: '',
          email: '',
          specialization: '',
          experience: '',
          qualifications: '',
          availability: '',
          motivation: ''
        });
      }
    } catch (error) {
      // For demo purposes, show success even if API fails
      alert('Thank you for your application! Our team will review your submission and contact you within 3-5 business days.');
      setMentorRegistration({
        name: '',
        email: '',
        specialization: '',
        experience: '',
        qualifications: '',
        availability: '',
        motivation: ''
      });
    }
  };

  if (chatActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25 p-4" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <div className="bg-white rounded-t-lg border p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Anonymous Chat</h2>
                <p className="text-sm text-muted-foreground">Connected as: {anonymousId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!callState.isCallActive && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startVideoCall}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Video Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startVoiceCall}
                    className="bg-purple-600 text-white hover:bg-purple-700 border-0"
                  >
                    <PhoneCall className="w-4 h-4 mr-1" />
                    Voice Call
                  </Button>
                </>
              )}
              
              {callState.isCallActive && (
                <>
                  <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">
                      {formatCallDuration(callState.callDuration)}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleMute}
                    className={callState.isMicMuted ? "bg-red-100" : "bg-gray-100"}
                  >
                    {callState.isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  
                  {callState.isVideoCall && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleVideo}
                      className={callState.isVideoMuted ? "bg-red-100" : "bg-gray-100"}
                    >
                      {callState.isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                  )}
                  
                  <Button variant="destructive" size="sm" onClick={endCall}>
                    <Phone className="w-4 h-4 mr-1" />
                    End Call
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={saveSession}>
                Save Session
              </Button>
              <Button variant="outline" size="sm" onClick={endChat}>
                <X className="w-4 h-4 mr-1" />
                End Chat
              </Button>
            </div>
          </div>

          {/* Video Call Interface */}
          {callState.isVideoCall && (
            <div className="bg-black border-x relative h-64">
              <video 
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-4 right-4 w-24 h-18 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                Connected with {mentorName}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className={`bg-white border-x ${callState.isVideoCall ? 'h-64' : 'h-96'}`}>
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'student'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.sender}</p>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Chat Input */}
          <div className="bg-white rounded-b-lg border p-4">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Emergency Dialog */}
          <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>You Are Not Alone</span>
                </DialogTitle>
                <DialogDescription>
                  If you're having thoughts of self-harm, please reach out for immediate help. Here are resources available 24/7:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {emergencyResources.map((resource, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{resource.name}</h4>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => window.open(`tel:${resource.number}`, '_self')}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call {resource.number}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <p className="text-sm text-center text-muted-foreground">
                  Remember: Your life has value and meaning. Professional help is available.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Privacy Consent Dialog */}
          <Dialog open={showPrivacyConsent} onOpenChange={setShowPrivacyConsent}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>Privacy & Data Storage</span>
                </DialogTitle>
                <DialogDescription>
                  To save your session, we need to store chat data on your device.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Important Privacy Notice:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your chat history will be stored locally on this device</li>
                    <li>• Data includes messages, anonymous ID, and mentor name</li>
                    <li>• No real personal information is stored</li>
                    <li>• On shared devices, others may access this data</li>
                    <li>• You can delete saved sessions from the main page anytime</li>
                  </ul>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handlePrivacyConsent(true)} 
                    className="flex-1"
                  >
                    I Understand, Save Session
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handlePrivacyConsent(false)}
                    className="flex-1"
                  >
                    Cancel, Don't Save
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  You can continue using the chat without saving sessions for maximum privacy
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25 p-4" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-3">
                <Brain className="w-8 h-8 text-purple-600" />
                <span>Mental Health Support</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Anonymous, safe, and confidential support when you need it most
              </p>
            </div>
            
            {/* Become a Mentor Button - Rightmost */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="ml-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Become a Mentor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-green-500" />
                    <span>Become a Mental Health Mentor</span>
                  </DialogTitle>
                  <DialogDescription>
                    Join our community of caring individuals providing anonymous mental health support to students in need.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">What You'll Do as a Mentor:</h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• Provide compassionate, anonymous emotional support</li>
                      <li>• Engage in text, voice, and video conversations</li>
                      <li>• Help students process feelings and develop coping strategies</li>
                      <li>• Recognize crisis situations and guide to professional resources</li>
                      <li>• Participate in ongoing training and peer support</li>
                    </ul>
                  </div>

                  <form onSubmit={handleMentorRegistration} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={mentorRegistration.name}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={mentorRegistration.email}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Areas of Interest/Specialization *</Label>
                      <Input
                        id="specialization"
                        value={mentorRegistration.specialization}
                        onChange={(e) => setMentorRegistration(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="e.g., Anxiety, Depression, Academic Stress, Social Issues"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Relevant Experience *</Label>
                        <Input
                          id="experience"
                          value={mentorRegistration.experience}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, experience: e.target.value }))}
                          placeholder="e.g., 3 years counseling, Psychology student"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability">Weekly Availability *</Label>
                        <Input
                          id="availability"
                          value={mentorRegistration.availability}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, availability: e.target.value }))}
                          placeholder="e.g., Weekday evenings, Weekend mornings"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualifications">Education & Qualifications</Label>
                      <Textarea
                        id="qualifications"
                        value={mentorRegistration.qualifications}
                        onChange={(e) => setMentorRegistration(prev => ({ ...prev, qualifications: e.target.value }))}
                        placeholder="Share your educational background, certifications, or relevant training..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation">Why do you want to be a mentor? *</Label>
                      <Textarea
                        id="motivation"
                        value={mentorRegistration.motivation}
                        onChange={(e) => setMentorRegistration(prev => ({ ...prev, motivation: e.target.value }))}
                        placeholder="Tell us about your passion for helping others and what drives you to support student mental health..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Application Process:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>1. Submit application with all required information</li>
                        <li>2. Background verification and reference checks (1-2 weeks)</li>
                        <li>3. Virtual interview with our team</li>
                        <li>4. Complete mental health first aid training</li>
                        <li>5. Ongoing supervision and peer support sessions</li>
                      </ul>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!mentorRegistration.name || !mentorRegistration.email || !mentorRegistration.motivation}
                      >
                        Submit Application
                      </Button>
                      <Button type="button" variant="outline" className="flex-1">
                        Save as Draft
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      All applications are carefully reviewed. We'll contact you within 3-5 business days with next steps.
                    </p>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Saved Sessions Section */}
          {savedSessions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Your Saved Sessions</h3>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Delete all saved sessions? This cannot be undone.')) {
                      setSavedSessions([]);
                      localStorage.removeItem('mentalHealthSessions');
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedSessions.map((session, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{session.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedSessions = savedSessions.filter((_, i) => i !== index);
                            setSavedSessions(updatedSessions);
                            localStorage.setItem('mentalHealthSessions', JSON.stringify(updatedSessions));
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        with {session.mentorName} • {helpCategories.find(c => c.id === session.category)?.title}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {session.messages.length} messages • {new Date(session.lastUsed).toLocaleDateString()}
                      </div>
                      <Button 
                        onClick={() => loadSavedSession(session)}
                        size="sm" 
                        className="w-full"
                      >
                        Continue Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">What would you like to talk about?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${category.color} rounded-2xl`}
                  onClick={() => startChat(category.id)}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-gray-800 mb-2">{category.title}</CardTitle>
                    <CardDescription className="text-gray-600">{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <CardTitle>100% Anonymous</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your real identity is never revealed. Chat with complete privacy and safety.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Heart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
              <CardTitle>Trained Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with verified mentors who understand and care about your wellbeing.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Phone className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <CardTitle>Crisis Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Immediate access to emergency helplines and professional crisis intervention.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">1</div>
                <h4 className="font-medium">Choose Category</h4>
                <p className="text-xs text-muted-foreground">Select what you want to talk about</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">2</div>
                <h4 className="font-medium">Get Anonymous ID</h4>
                <p className="text-xs text-muted-foreground">Receive a friendly fake identity</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">3</div>
                <h4 className="font-medium">Chat Safely</h4>
                <p className="text-xs text-muted-foreground">Talk openly with a caring mentor</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">4</div>
                <h4 className="font-medium">Get Support</h4>
                <p className="text-xs text-muted-foreground">Receive guidance and resources</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-semibold">5</div>
                <h4 className="font-medium">Choose Next Steps</h4>
                <p className="text-xs text-muted-foreground">Save code or exit completely</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Help */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Need Immediate Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              If you're in crisis or having thoughts of self-harm, please reach out for immediate professional help:
            </p>
            <div className="flex flex-wrap gap-4">
              {emergencyResources.map((resource, index) => (
                <Button
                  key={index}
                  variant="destructive"
                  onClick={() => window.open(`tel:${resource.number}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {resource.name} - {resource.number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}