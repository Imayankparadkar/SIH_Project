interface GeminiResponse {
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  confidence: number;
}

interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  timestamp: Date;
}

export class GeminiHealthAnalyzer {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Health analysis will use fallback responses.');
    }
  }

  async analyzeVitalSigns(vitals: VitalSigns, userAge: number, userGender: string): Promise<GeminiResponse> {
    if (!this.apiKey) {
      return this.getFallbackAnalysis(vitals);
    }

    const prompt = `As a medical AI assistant, analyze the following vital signs for a ${userAge}-year-old ${userGender}:

Heart Rate: ${vitals.heartRate} BPM
Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg
Oxygen Saturation: ${vitals.oxygenSaturation}%
Body Temperature: ${vitals.bodyTemperature}°F
Timestamp: ${vitals.timestamp.toISOString()}

Please provide:
1. Overall health analysis
2. Risk level (low/medium/high/critical)
3. Specific recommendations
4. Any anomalies detected
5. Confidence level (0-1)

Respond in JSON format with keys: analysis, riskLevel, recommendations (array), anomalies (array), confidence.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error('No response from Gemini API');
      }

      // Parse JSON response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          analysis: analysis.analysis || 'Analysis completed',
          riskLevel: analysis.riskLevel || 'low',
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          anomalies: Array.isArray(analysis.anomalies) ? analysis.anomalies : [],
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8
        };
      }

      return this.getFallbackAnalysis(vitals);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.getFallbackAnalysis(vitals);
    }
  }

  async generateChatResponse(message: string, healthContext?: VitalSigns): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackChatResponse(message);
    }

    const systemPrompt = `You are Dr. AI, a virtual health assistant. Provide helpful, accurate health information while being empathetic and clear. Always recommend consulting healthcare professionals for serious concerns.`;
    
    const contextInfo = healthContext ? 
      `\n\nUser's current health context:
      - Heart Rate: ${healthContext.heartRate} BPM
      - Blood Pressure: ${healthContext.bloodPressureSystolic}/${healthContext.bloodPressureDiastolic} mmHg
      - Oxygen Saturation: ${healthContext.oxygenSaturation}%
      - Body Temperature: ${healthContext.bodyTemperature}°F` : '';

    const prompt = `${systemPrompt}\n\nUser question: ${message}${contextInfo}\n\nProvide a helpful response:`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackChatResponse(message);
    } catch (error) {
      console.error('Error in chat response:', error);
      return this.getFallbackChatResponse(message);
    }
  }

  private getFallbackAnalysis(vitals: VitalSigns): GeminiResponse {
    const { heartRate, bloodPressureSystolic, bloodPressureDiastolic, oxygenSaturation, bodyTemperature } = vitals;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Basic vital signs assessment
    if (heartRate < 60 || heartRate > 100) {
      anomalies.push(`Heart rate ${heartRate} BPM is outside normal range (60-100 BPM)`);
      riskLevel = heartRate < 50 || heartRate > 120 ? 'high' : 'medium';
    }

    if (bloodPressureSystolic > 140 || bloodPressureDiastolic > 90) {
      anomalies.push(`Blood pressure ${bloodPressureSystolic}/${bloodPressureDiastolic} indicates hypertension`);
      riskLevel = bloodPressureSystolic > 160 || bloodPressureDiastolic > 100 ? 'high' : 'medium';
    }

    if (oxygenSaturation < 95) {
      anomalies.push(`Oxygen saturation ${oxygenSaturation}% is below normal (95-100%)`);
      riskLevel = oxygenSaturation < 90 ? 'critical' : 'high';
    }

    if (bodyTemperature > 100.4 || bodyTemperature < 97) {
      anomalies.push(`Body temperature ${bodyTemperature}°F indicates fever or hypothermia`);
      riskLevel = bodyTemperature > 103 || bodyTemperature < 95 ? 'high' : 'medium';
    }

    // Generate recommendations
    if (anomalies.length === 0) {
      recommendations.push('All vital signs are within normal ranges. Continue maintaining healthy lifestyle habits.');
    } else {
      recommendations.push('Monitor your vital signs closely and consult with your healthcare provider.');
      recommendations.push('Ensure adequate rest, hydration, and follow prescribed medications.');
    }

    return {
      analysis: anomalies.length === 0 
        ? 'Your vital signs are within normal ranges indicating good health status.'
        : `Analysis shows ${anomalies.length} parameter(s) outside normal ranges that require attention.`,
      riskLevel,
      recommendations,
      anomalies,
      confidence: 0.85
    };
  }

  private getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('bp')) {
      return 'Blood pressure is an important indicator of cardiovascular health. Normal blood pressure is typically around 120/80 mmHg. If you have concerns about your blood pressure, please consult with your healthcare provider for proper evaluation and guidance.';
    }
    
    if (lowerMessage.includes('heart rate') || lowerMessage.includes('pulse')) {
      return 'A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Factors like fitness level, medications, and emotions can affect your heart rate. If you notice unusual changes, consider discussing them with your doctor.';
    }
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('fever')) {
      return 'Normal body temperature is around 98.6°F (37°C). A fever is generally considered 100.4°F (38°C) or higher. If you have a persistent fever or other concerning symptoms, please consult with a healthcare professional.';
    }
    
    if (lowerMessage.includes('oxygen') || lowerMessage.includes('spo2')) {
      return 'Normal oxygen saturation levels are typically 95-100%. Lower levels may indicate respiratory or circulatory issues. If you consistently see readings below 95%, please seek medical attention.';
    }
    
    return 'I understand your health concern. For personalized medical advice, please consult with your healthcare provider. I can help provide general health information and guide you to appropriate resources. Is there a specific aspect of your health you\'d like to discuss?';
  }
}

export const geminiAnalyzer = new GeminiHealthAnalyzer();
