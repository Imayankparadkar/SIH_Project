import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Import PDF parsing library
import pdfParse from 'pdf-parse';

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
  private genAI: GoogleGenAI | null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable not found. AI analysis will use fallback responses.');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async analyzeVitalSigns(
    vitals: VitalSigns, 
    userAge: number, 
    userGender: string,
    medicalHistory?: string
  ): Promise<HealthAnalysisResult> {
    if (!this.genAI) {
      return this.getFallbackAnalysis(vitals);
    }
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
      const response = await this.genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      const text = response.text || '';

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
    userProfile?: { age: number; gender: string; medicalHistory?: string },
    language?: string
  ): Promise<string> {
    if (!this.genAI) {
      return this.getFallbackChatResponse(message);
    }
    const getLanguageInstruction = (lang: string) => {
      const languageInstructions = {
        'hi': 'Respond in Hindi (हिंदी). Use simple, clear Hindi language.',
        'es': 'Respond in Spanish (Español). Use clear, accessible Spanish.',
        'fr': 'Respond in French (Français). Use clear, accessible French.',
        'en': 'Respond in English.'
      };
      return languageInstructions[lang as keyof typeof languageInstructions] || languageInstructions['en'];
    };

    const systemPrompt = `You are Dr. AI, a compassionate virtual health assistant developed by Sehatify. You provide helpful, accurate health information while being empathetic and clear. 

Your responses should be comprehensive and include:
🏃‍♂️ **EXERCISE PLANS**: Provide specific, structured workout routines with:
- Beginner/intermediate/advanced options
- Daily/weekly schedules
- Specific exercises with sets/reps/duration
- Modifications for different fitness levels

🥗 **DIET RECOMMENDATIONS**: Include detailed nutritional guidance with:
- Specific meal plans (breakfast, lunch, dinner, snacks)
- Food portions and timing
- Nutrient-rich food suggestions
- Hydration guidelines
- Foods to avoid/include for specific conditions

📹 **YOUTUBE VIDEO SUGGESTIONS**: Always recommend specific YouTube channels and videos such as:
- **Fitness**: "Fitness Blender", "Chloe Ting", "HIIT Workouts", "Yoga with Adriene", "FitnessBlender HIIT", "Pamela Reif workouts"
- **Mental Health**: "Headspace meditation", "The Honest Guys guided meditation", "Michelle Schroeder-Gardner motivation", "TED Talks motivation"
- **Nutrition**: "Pick Up Limes healthy recipes", "Cheap Lazy Vegan meal prep", "Brothers Green Eats", "Nutrition Made Simple"
- **Sleep & Relaxation**: "Jason Stephenson sleep meditation", "The Honest Guys sleep stories", "Michael Sealey hypnosis"
- **Motivation**: "Motivation Madness", "TED Talks", "Tony Robbins", "Mel Robbins 5 Second Rule"

When suggesting videos, use this format: "Search for '[Video Title]' on YouTube" or "Check out [Channel Name] on YouTube for [specific content type]"

💪 **MOTIVATIONAL CONTENT**: Always include:
- Encouraging words and positive affirmations
- Realistic goal-setting advice
- Tips for building healthy habits
- Stress management techniques
- Mental wellness support

Important guidelines:
- Always recommend consulting healthcare professionals for serious concerns
- Provide practical, actionable advice when appropriate
- Be supportive and understanding
- Include specific, measurable recommendations
- Add motivational and encouraging language
- Explain medical terms in simple language
- If discussing symptoms, always emphasize the importance of professional medical evaluation
- Respect patient privacy and maintain confidentiality
- ${getLanguageInstruction(language || 'en')}`;

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
      const response = await this.genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      return response.text || "I apologize, but I'm having trouble processing your request right now.";
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
    if (!this.genAI) {
      return this.getFallbackHealthReport(vitals, userProfile, reportType);
    }
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
      const response = await this.genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      const text = response.text || '';

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

  async extractTextFromFile(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } else if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf8');
      } else {
        // For other file types (images, etc.), we'll need OCR
        // For now, return a message indicating the file type
        throw new Error(`Text extraction from ${ext} files not supported yet. Please upload PDF or text files.`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeMedicalDocument(
    documentText: string,
    documentType: 'lab_report' | 'prescription' | 'medical_record',
    language?: string
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos: { title: string; searchTerm: string }[];
    lifestyleChanges: string[];
    actionPlan: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  }> {
    if (!this.genAI) {
      return this.getFallbackDocumentAnalysis(documentType, language || 'en');
    }
    const getLanguageInstruction = (lang: string) => {
      const languageInstructions = {
        'hi': 'Provide the analysis in Hindi (हिंदी). Use simple, clear Hindi language.',
        'es': 'Provide the analysis in Spanish (Español). Use clear, accessible Spanish.',
        'fr': 'Provide the analysis in French (Français). Use clear, accessible French.',
        'de': 'Provide the analysis in German (Deutsch). Use clear, accessible German.',
        'pt': 'Provide the analysis in Portuguese (Português). Use clear, accessible Portuguese.',
        'it': 'Provide the analysis in Italian (Italiano). Use clear, accessible Italian.',
        'ja': 'Provide the analysis in Japanese (日本語). Use simple, clear Japanese.',
        'ko': 'Provide the analysis in Korean (한국어). Use simple, clear Korean.',
        'zh': 'Provide the analysis in Chinese (中文). Use simple, clear Chinese.',
        'ar': 'Provide the analysis in Arabic (العربية). Use simple, clear Arabic.',
        'ru': 'Provide the analysis in Russian (Русский). Use clear, accessible Russian.',
        'tr': 'Provide the analysis in Turkish (Türkçe). Use clear, accessible Turkish.',
        'en': 'Provide the analysis in English.'
      };
      return languageInstructions[lang as keyof typeof languageInstructions] || languageInstructions['en'];
    };

    const prompt = `You are Dr. AI, a comprehensive health assistant. Analyze the following ${documentType.replace('_', ' ')} and provide a complete, patient-friendly health plan.

${getLanguageInstruction(language || 'en')}

Document Content:
${documentText}

Please provide a comprehensive analysis that includes:

🏥 **MEDICAL ANALYSIS**:
1. Clear, easy-to-understand summary of the document
2. Key findings that the patient should be aware of
3. Risk factors and areas of concern
4. Follow-up recommendations

🥗 **PERSONALIZED DIET PLAN**:
- Specific foods to include/avoid based on the findings
- Meal timing and portion suggestions
- Hydration recommendations
- Nutritional supplements if needed

🏃‍♂️ **EXERCISE RECOMMENDATIONS**:
- Specific exercise types suitable for the condition
- Intensity levels (beginner/intermediate/advanced)
- Duration and frequency guidelines
- Exercises to avoid if any

📹 **YOUTUBE VIDEO RECOMMENDATIONS**:
- Search for "Heart Healthy Diet Plan" on YouTube for cardiovascular issues
- Search for "Diabetes Exercise Routine" on YouTube for diabetes-related findings
- Check out "Yoga with Adriene" for stress management and flexibility
- Look for "Fitness Blender HIIT" for general fitness improvement
- Search for "Mediterranean Diet Recipes" for anti-inflammatory benefits
- Find "Meditation for Healing" for mental wellness support

💪 **LIFESTYLE MODIFICATIONS**:
- Sleep hygiene recommendations
- Stress management techniques
- Habit formation tips
- Mental wellness support

🎯 **ACTION PLAN**:
- Immediate steps to take
- Short-term goals (1-4 weeks)
- Long-term goals (1-6 months)
- When to seek emergency care

Respond in JSON format with keys: 
- summary (string)
- keyFindings (array)
- recommendations (array)
- dietPlan (object with breakfast, lunch, dinner, snacks arrays)
- exercisePlan (object with cardio, strength, flexibility arrays)
- youtubeVideos (array of objects with title and searchTerm)
- lifestyleChanges (array)
- actionPlan (object with immediate, shortTerm, longTerm arrays)
- followUpNeeded (boolean)

Important: This analysis is for informational purposes only and should not replace professional medical advice. Always consult healthcare providers for medical decisions.`;

    // Retry mechanism for API overload errors
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await this.genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });
        const text = response.text || '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            summary: analysis.summary || 'Document analysis completed',
            keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [],
            recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
            dietPlan: analysis.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [] },
            exercisePlan: analysis.exercisePlan || { cardio: [], strength: [], flexibility: [] },
            youtubeVideos: Array.isArray(analysis.youtubeVideos) ? analysis.youtubeVideos : [],
            lifestyleChanges: Array.isArray(analysis.lifestyleChanges) ? analysis.lifestyleChanges : [],
            actionPlan: analysis.actionPlan || { immediate: [], shortTerm: [], longTerm: [] },
            followUpNeeded: typeof analysis.followUpNeeded === 'boolean' ? analysis.followUpNeeded : true
          };
        }

        throw new Error('Invalid response format');
      } catch (error: any) {
        retryCount++;
        console.error(`Document analysis attempt ${retryCount} failed:`, error);
        
        // Check if it's an API overload error
        if (error.status === 503 && retryCount < maxRetries) {
          console.log(`API overloaded, retrying in ${retryCount * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
          continue;
        }
        
        // If all retries failed or it's a different error, throw
        throw new Error('Failed to analyze medical document after retries');
      }
    }
    
    // This should never be reached due to the throw above, but TypeScript requires it
    throw new Error('Analysis failed after all retry attempts');
  }
  private getFallbackDocumentAnalysis(
    documentType: string,
    language: string
  ): {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos: { title: string; searchTerm: string }[];
    lifestyleChanges: string[];
    actionPlan: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  } {
    const languageResponses = {
      'en': {
        summary: `Document uploaded successfully. AI analysis is currently unavailable, but your ${documentType.replace('_', ' ')} has been securely stored.`,
        keyFindings: ["Document successfully uploaded and stored", "AI analysis unavailable - manual review recommended"],
        recommendations: ["Consult with your healthcare provider for document interpretation", "Share this document during your next medical appointment", "Keep a copy for your personal medical records"],
        followUpNeeded: true
      },
      'hi': {
        summary: `दस्तावेज़ सफलतापूर्वक अपलोड किया गया। AI विश्लेषण वर्तमान में उपलब्ध नहीं है, लेकिन आपका ${documentType.replace('_', ' ')} सुरक्षित रूप से संग्रहीत किया गया है।`,
        keyFindings: ["दस्तावेज़ सफलतापूर्वक अपलोड और संग्रहीत", "AI विश्लेषण अनुपलब्ध - मैन्युअल समीक्षा की सिफारिश"],
        recommendations: ["दस्तावेज़ की व्याख्या के लिए अपने स्वास्थ्य सेवा प्रदाता से सलाह लें", "अपनी अगली चिकित्सा नियुक्ति के दौरान इस दस्तावेज़ को साझा करें"],
        followUpNeeded: true
      },
      'es': {
        summary: `Documento subido exitosamente. El análisis de IA no está disponible actualmente, pero su ${documentType.replace('_', ' ')} ha sido almacenado de forma segura.`,
        keyFindings: ["Documento subido y almacenado exitosamente", "Análisis de IA no disponible - se recomienda revisión manual"],
        recommendations: ["Consulte con su proveedor de atención médica para la interpretación del documento", "Comparta este documento durante su próxima cita médica"],
        followUpNeeded: true
      },
      'fr': {
        summary: `Document téléchargé avec succès. L'analyse IA n'est actuellement pas disponible, mais votre ${documentType.replace('_', ' ')} a été stocké en sécurité.`,
        keyFindings: ["Document téléchargé et stocké avec succès", "Analyse IA indisponible - examen manuel recommandé"],
        recommendations: ["Consultez votre prestataire de soins de santé pour l'interprétation du document", "Partagez ce document lors de votre prochaine consultation médicale"],
        followUpNeeded: true
      }
    };

    const baseResponse = languageResponses[language as keyof typeof languageResponses] || languageResponses['en'];
    return {
      ...baseResponse,
      dietPlan: { 
        breakfast: ["Consult your healthcare provider for personalized dietary recommendations"], 
        lunch: [], 
        dinner: [], 
        snacks: [] 
      },
      exercisePlan: { 
        cardio: ["Consult your healthcare provider for exercise recommendations"], 
        strength: [], 
        flexibility: [] 
      },
      youtubeVideos: [
        { title: "General Health Tips", searchTerm: "basic health tips for beginners" }
      ],
      lifestyleChanges: ["Maintain regular healthcare checkups", "Follow your doctor's recommendations"],
      actionPlan: { 
        immediate: ["Contact your healthcare provider"], 
        shortTerm: ["Schedule a consultation"], 
        longTerm: ["Follow medical advice"] 
      }
    };
  }

  private getFallbackChatResponse(message: string): string {
    const responses = [
      "I'm here to help with your health questions. As a development version, I recommend consulting with a healthcare professional for personalized medical advice.",
      "Thank you for your question about health. While I can provide general information, please consult with your doctor for specific medical guidance.",
      "I appreciate your health inquiry. For personalized medical advice and accurate diagnosis, I recommend speaking with a qualified healthcare provider.",
      "I'm glad you're taking an active interest in your health. For the best care, please discuss your concerns with a medical professional."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getFallbackHealthReport(
    vitals: VitalSigns[],
    userProfile: { age: number; gender: string; name: string; medicalHistory?: string },
    reportType: 'weekly' | 'monthly' | 'custom'
  ) {
    return {
      summary: `Basic ${reportType} health report for ${userProfile.name}. Your vital signs have been monitored over this period.`,
      recommendations: [
        "Continue monitoring your vital signs regularly",
        "Maintain a healthy lifestyle with proper diet and exercise",
        "Get adequate sleep and manage stress levels",
        "Consult with your healthcare provider for comprehensive evaluation"
      ],
      riskFactors: [
        "Individual risk factors vary - consult with your doctor for personalized assessment"
      ],
      improvements: [
        "Consistent monitoring shows engagement with your health",
        "Regular check-ins demonstrate good health awareness"
      ]
    };
  }

  private getFallbackAnalysis(vitals: VitalSigns): HealthAnalysisResult {
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
}

export const geminiHealthService = new GeminiHealthService();
