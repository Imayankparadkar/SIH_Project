import { GoogleGenerativeAI } from '@google/generative-ai';

interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  timestamp: Date;
}

interface HealthAnalysisResult {
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  confidence: number;
}

export class GeminiHealthService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeVitalSigns(
    vitals: VitalSigns, 
    userAge: number, 
    userGender: string,
    medicalHistory?: string
  ): Promise<HealthAnalysisResult> {
    const prompt = `As a medical AI assistant, analyze the following vital signs for a ${userAge}-year-old ${userGender}:

Vital Signs:
- Heart Rate: ${vitals.heartRate} BPM
- Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg
- Oxygen Saturation: ${vitals.oxygenSaturation}%
- Body Temperature: ${vitals.bodyTemperature}°F
- Timestamp: ${vitals.timestamp.toISOString()}

${medicalHistory ? `Medical History: ${medicalHistory}` : ''}

Please provide a comprehensive analysis including:
1. Overall health assessment
2. Risk level (low/medium/high/critical)
3. Specific recommendations for the patient
4. Any anomalies or concerning patterns detected
5. Confidence level in the analysis (0-1)

Respond in JSON format with keys: analysis, riskLevel, recommendations (array), anomalies (array), confidence.

Focus on:
- Normal ranges for the patient's age and gender
- Immediate risks that require medical attention
- Preventive measures and lifestyle recommendations
- Clear explanations that a patient can understand`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          analysis: analysis.analysis || 'Health analysis completed',
          riskLevel: analysis.riskLevel || 'low',
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          anomalies: Array.isArray(analysis.anomalies) ? analysis.anomalies : [],
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8
        };
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error analyzing vital signs with Gemini:', error);
      throw new Error('Failed to analyze vital signs');
    }
  }

  async generateChatResponse(
    message: string, 
    healthContext?: VitalSigns,
    userProfile?: { age: number; gender: string; medicalHistory?: string }
  ): Promise<string> {
    const systemPrompt = `You are Dr. AI, a compassionate virtual health assistant developed by Sehatify. You provide helpful, accurate health information while being empathetic and clear. 

Important guidelines:
- Always recommend consulting healthcare professionals for serious concerns
- Provide practical, actionable advice when appropriate
- Be supportive and understanding
- Explain medical terms in simple language
- If discussing symptoms, always emphasize the importance of professional medical evaluation
- Respect patient privacy and maintain confidentiality`;

    const contextInfo = healthContext ? 
      `Current vital signs context:
      - Heart Rate: ${healthContext.heartRate} BPM
      - Blood Pressure: ${healthContext.bloodPressureSystolic}/${healthContext.bloodPressureDiastolic} mmHg
      - Oxygen Saturation: ${healthContext.oxygenSaturation}%
      - Body Temperature: ${healthContext.bodyTemperature}°F` : '';

    const userInfo = userProfile ?
      `User profile: ${userProfile.age}-year-old ${userProfile.gender}${userProfile.medicalHistory ? `, Medical history: ${userProfile.medicalHistory}` : ''}` : '';

    const prompt = `${systemPrompt}

${userInfo}
${contextInfo}

User question: ${message}

Provide a helpful, empathetic response as Dr. AI. Keep your response conversational but informative.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I apologize, but I'm having trouble processing your request right now. For immediate health concerns, please contact your healthcare provider or emergency services.";
    }
  }

  async generateHealthReport(
    vitals: VitalSigns[],
    userProfile: { age: number; gender: string; name: string; medicalHistory?: string },
    reportType: 'weekly' | 'monthly' | 'custom'
  ): Promise<{
    summary: string;
    recommendations: string[];
    riskFactors: string[];
    improvements: string[];
  }> {
    const prompt = `Generate a comprehensive ${reportType} health report for ${userProfile.name}, a ${userProfile.age}-year-old ${userProfile.gender}.

Vital Signs Data (${vitals.length} readings):
${vitals.slice(0, 10).map((v, i) => `
Reading ${i + 1} (${v.timestamp.toLocaleDateString()}):
- Heart Rate: ${v.heartRate} BPM
- Blood Pressure: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg
- Oxygen Saturation: ${v.oxygenSaturation}%
- Body Temperature: ${v.bodyTemperature}°F`).join('')}

${userProfile.medicalHistory ? `Medical History: ${userProfile.medicalHistory}` : ''}

Please provide:
1. Executive summary of health status
2. Specific recommendations for improvement
3. Identified risk factors
4. Areas of improvement or positive trends

Respond in JSON format with keys: summary, recommendations (array), riskFactors (array), improvements (array).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const report = JSON.parse(jsonMatch[0]);
        return {
          summary: report.summary || 'Health report generated successfully',
          recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
          riskFactors: Array.isArray(report.riskFactors) ? report.riskFactors : [],
          improvements: Array.isArray(report.improvements) ? report.improvements : []
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating health report:', error);
      throw new Error('Failed to generate health report');
    }
  }

  async analyzeMedicalDocument(
    documentText: string,
    documentType: 'lab_report' | 'prescription' | 'medical_record'
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    followUpNeeded: boolean;
  }> {
    const prompt = `Analyze the following ${documentType.replace('_', ' ')} and provide a patient-friendly summary:

Document Content:
${documentText}

Please provide:
1. A clear, easy-to-understand summary
2. Key findings that the patient should be aware of
3. General recommendations (emphasizing doctor consultation)
4. Whether follow-up with a healthcare provider is recommended

Respond in JSON format with keys: summary, keyFindings (array), recommendations (array), followUpNeeded (boolean).

Important: Always emphasize that this analysis is for informational purposes only and should not replace professional medical advice.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          summary: analysis.summary || 'Document analysis completed',
          keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [],
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          followUpNeeded: typeof analysis.followUpNeeded === 'boolean' ? analysis.followUpNeeded : true
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing medical document:', error);
      throw new Error('Failed to analyze medical document');
    }
  }
}

export const geminiHealthService = new GeminiHealthService();
