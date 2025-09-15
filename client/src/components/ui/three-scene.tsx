import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ThreeSceneProps {
  className?: string;
  isVisible?: boolean;
  animationState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  onInteraction?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start' | 'end' | 'soundstart' | 'soundend', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function ThreeScene({ 
  className = "", 
  isVisible = true, 
  animationState = 'idle',
  onInteraction
}: ThreeSceneProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.addEventListener('start', () => {
      setIsListening(true);
    });

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      processUserInput(transcript);
    });

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
    });

    recognition.start();
  };

  const processUserInput = async (input: string) => {
    // Simple AI responses for health-related queries
    let aiResponse = '';
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('nutrition')) {
      aiResponse = "For a healthy diet, focus on whole foods: plenty of vegetables, fruits, lean proteins, and whole grains. Limit processed foods, sugar, and excess sodium. Stay hydrated with water throughout the day.";
    } else if (lowerInput.includes('exercise') || lowerInput.includes('workout') || lowerInput.includes('fitness')) {
      aiResponse = "Regular exercise is crucial for health. Aim for at least 150 minutes of moderate aerobic activity weekly, plus strength training twice a week. Start slowly and gradually increase intensity.";
    } else if (lowerInput.includes('sleep') || lowerInput.includes('rest')) {
      aiResponse = "Quality sleep is vital for health. Adults need 7-9 hours nightly. Maintain a consistent sleep schedule, create a dark, cool environment, and avoid screens before bedtime.";
    } else if (lowerInput.includes('stress') || lowerInput.includes('anxiety')) {
      aiResponse = "Managing stress is important for overall health. Try deep breathing, meditation, regular exercise, and maintaining social connections. If stress persists, consider speaking with a healthcare professional.";
    } else if (lowerInput.includes('water') || lowerInput.includes('hydration')) {
      aiResponse = "Stay well hydrated by drinking water throughout the day. Most adults need about 8 glasses daily, but this varies based on activity level, climate, and individual needs.";
    } else {
      aiResponse = "I'm here to help with your health questions! I can provide guidance on diet, exercise, sleep, stress management, and general wellness. What specific health topic would you like to discuss?";
    }

    setResponse(aiResponse);
    speakResponse(aiResponse);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`${className} relative`}>
      {/* Sketchfab 3D Doctor Embed */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-white rounded-lg border border-blue-100 overflow-hidden">
        <div className="sketchfab-embed-wrapper h-full">
          <iframe 
            title="Doctor - Sketchfab Weekly - 13 Mar'23" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            src="https://sketchfab.com/models/9c89a438a5e940e59a0f9a07c22d6ade/embed?ui_theme=dark"
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {/* AI Doctor Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">AI Health Assistant</h3>
          <div className="flex gap-2">
            <Button
              onClick={isListening ? undefined : startListening}
              disabled={isListening}
              variant={isListening ? "default" : "outline"}
              size="sm"
              className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Listening..." : "Speak"}
            </Button>
            <Button
              onClick={isSpeaking ? stopSpeaking : undefined}
              disabled={!isSpeaking}
              variant={isSpeaking ? "default" : "outline"}
              size="sm"
              className={isSpeaking ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? "Stop" : "Listen"}
            </Button>
          </div>
        </div>
        
        {transcript && (
          <div className="mb-2 p-2 bg-gray-100 rounded text-sm">
            <strong>You:</strong> {transcript}
          </div>
        )}
        
        {response && (
          <div className="p-2 bg-blue-50 rounded text-sm">
            <strong>AI Doctor:</strong> {response}
          </div>
        )}
        
        {!transcript && !response && (
          <p className="text-sm text-gray-600">
            Click "Speak" to ask the AI doctor about diet, exercise, sleep, stress management, and more!
          </p>
        )}
      </div>

      {/* Status Indicators */}
      {animationState === 'listening' && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Listening...
        </div>
      )}
      
      {animationState === 'thinking' && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Thinking...
        </div>
      )}
      
      {animationState === 'speaking' && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Speaking...
        </div>
      )}
    </div>
  );
}