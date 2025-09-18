import { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, Heart, Shield, Phone, UserPlus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

const helpCategories = [
  {
    id: 'loneliness' as HelpCategory,
    title: 'Loneliness & Stress',
    description: 'When you feel isolated or overwhelmed',
    icon: Heart,
    color: 'bg-pink-50 hover:bg-pink-100'
  },
  {
    id: 'study' as HelpCategory,
    title: 'Study/Exam Pressure',
    description: 'Academic stress and performance anxiety',
    icon: Brain,
    color: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'confidence' as HelpCategory,
    title: 'Confidence & Personality',
    description: 'Building self-esteem and social skills',
    icon: Shield,
    color: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'career' as HelpCategory,
    title: 'Career & Future Path',
    description: 'Planning your future and making decisions',
    icon: MessageCircle,
    color: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'listen' as HelpCategory,
    title: 'Just Need Someone to Listen',
    description: 'A safe space to express your thoughts',
    icon: Heart,
    color: 'bg-amber-50 hover:bg-amber-100'
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = () => {
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

    // Simulate mentor response after a delay
    setTimeout(() => {
      if (!selectedCategory) return; // Guard against null category
      
      const mentorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mentor',
        message: getMentorResponse(selectedCategory, messageText),
        timestamp: new Date(),
        sender: mentorName
      };

      setChatMessages(prev => [...prev, mentorResponse]);
      
      // Check for crisis keywords
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'no point', 'worthless'];
      if (crisisKeywords.some(keyword => messageText.toLowerCase().includes(keyword))) {
        setTimeout(() => {
          setShowEmergencyDialog(true);
        }, 2000);
      }
    }, 1500);
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
    alert(`Session saved: ${anonymousId}. Use this code to continue with ${mentorName}.`);
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

  if (chatActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <div className="bg-white rounded-t-lg border p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Anonymous Chat</h2>
                <p className="text-sm text-muted-foreground">Connected as: {anonymousId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={saveSession}>
                Save Session
              </Button>
              <Button variant="destructive" size="sm" onClick={endChat}>
                <X className="w-4 h-4 mr-1" />
                End Chat
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-white border-x h-96">
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
                          ? 'bg-blue-500 text-white'
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
                  <Shield className="w-5 h-5 text-blue-500" />
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
                    <li>• You can delete saved sessions anytime</li>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-3">
                <Brain className="w-8 h-8 text-blue-500" />
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
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Become a Mental Health Mentor</DialogTitle>
                  <DialogDescription>
                    Help students by providing emotional support and guidance in a safe, anonymous environment.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm">
                    As a mentor, you'll provide:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Anonymous emotional support</li>
                    <li>• Active listening and empathy</li>
                    <li>• Resource sharing and guidance</li>
                    <li>• Crisis identification and referral</li>
                  </ul>
                  <Button className="w-full" disabled>
                    Application System Coming Soon
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Mentor applications will require background verification and training
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Saved Sessions Section */}
          {savedSessions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Your Saved Sessions</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {savedSessions.map((session, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedSession(session)}
                    className="flex flex-col p-3 h-auto"
                  >
                    <span className="font-medium">{session.code}</span>
                    <span className="text-xs text-muted-foreground">
                      with {session.mentorName} • {helpCategories.find(c => c.id === session.category)?.title}
                    </span>
                  </Button>
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
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${category.color}`}
                  onClick={() => startChat(category.id)}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <IconComponent className="w-6 h-6" />
                      <span>{category.title}</span>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
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
              <Phone className="w-8 h-8 mx-auto text-blue-500 mb-2" />
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
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-semibold">1</div>
                <h4 className="font-medium">Choose Category</h4>
                <p className="text-xs text-muted-foreground">Select what you want to talk about</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-semibold">2</div>
                <h4 className="font-medium">Get Anonymous ID</h4>
                <p className="text-xs text-muted-foreground">Receive a friendly fake identity</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-semibold">3</div>
                <h4 className="font-medium">Chat Safely</h4>
                <p className="text-xs text-muted-foreground">Talk openly with a caring mentor</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-semibold">4</div>
                <h4 className="font-medium">Get Support</h4>
                <p className="text-xs text-muted-foreground">Receive guidance and resources</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-semibold">5</div>
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