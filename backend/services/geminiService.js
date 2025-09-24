const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Generate RTI application from text query
  async generateRTIFromText(query, options = {}) {
    try {
      const {
        department = 'Government Department',
        location = 'Your City',
        language = 'english',
        category = 'general',
        userDetails = {}
      } = options;

      const prompt = this.buildRTIPrompt(query, {
        department,
        location,
        language,
        category,
        userDetails
      });

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      return {
        success: true,
        generatedText,
        metadata: {
          originalQuery: query,
          department,
          location,
          language,
          category,
          model: 'gemini-1.5-flash',
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Error generating RTI from text:', error);
      throw new Error(`Failed to generate RTI application: ${error.message}`);
    }
  }

  // Process audio file and generate RTI
  async processAudioAndGenerateRTI(audioFilePath, options = {}) {
    try {
      // First, transcribe audio to text
      const transcription = await this.transcribeAudio(audioFilePath);
      
      if (!transcription.success || !transcription.text) {
        throw new Error('Failed to transcribe audio');
      }

      // Detect language from transcribed text
      const languageDetection = await this.detectLanguage(transcription.text);
      
      // Generate RTI using transcribed text
      const rtiResult = await this.generateRTIFromText(transcription.text, {
        ...options,
        language: languageDetection.language,
        detectedLanguage: languageDetection
      });

      return {
        success: true,
        ...rtiResult,
        audioTranscription: transcription,
        languageDetection: languageDetection
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      throw new Error(`Failed to process audio: ${error.message}`);
    }
  }

  // Transcribe audio to text
  async transcribeAudio(audioFilePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error('Audio file not found');
      }

      // Read audio file
      const audioData = fs.readFileSync(audioFilePath);
      const audioBase64 = audioData.toString('base64');

      // Get file extension to determine MIME type
      const ext = path.extname(audioFilePath).toLowerCase();
      const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.webm': 'audio/webm',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac'
      };

      const mimeType = mimeTypes[ext] || 'audio/mpeg';

      const prompt = `
        Please transcribe the following audio file to text. 
        Extract the spoken content accurately, including any specific details, numbers, dates, or names mentioned.
        If the audio contains multiple languages, please transcribe all of them.
        Return only the transcribed text without any additional commentary.
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const transcribedText = response.text().trim();

      return {
        success: true,
        text: transcribedText,
        language: 'detected', // Will be determined separately
        confidence: 'high',
        audioInfo: {
          filePath: audioFilePath,
          mimeType,
          size: audioData.length
        }
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return {
        success: false,
        error: error.message,
        text: null
      };
    }
  }

  // Detect language from text
  async detectLanguage(text) {
    try {
      const prompt = `
        Analyze the following text and determine the primary language it is written in.
        Return your response in the following JSON format:
        {
          "language": "language_code",
          "confidence": "high/medium/low",
          "detectedLanguages": ["lang1", "lang2"],
          "primaryLanguage": "language_name"
        }
        
        Supported languages: english, hindi, bengali, tamil, telugu, marathi, gujarati
        If the text is in a mix of languages, identify the primary language.
        
        Text to analyze: "${text}"
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const resultText = response.text();

      try {
        // Try to parse JSON response
        const languageInfo = JSON.parse(resultText);
        return {
          success: true,
          ...languageInfo
        };
      } catch (parseError) {
        // If JSON parsing fails, try to extract language from text
        const detectedLanguage = this.extractLanguageFromText(resultText);
        return {
          success: true,
          language: detectedLanguage,
          confidence: 'medium',
          detectedLanguages: [detectedLanguage],
          primaryLanguage: this.getLanguageName(detectedLanguage)
        };
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      return {
        success: false,
        error: error.message,
        language: 'english', // fallback
        confidence: 'low'
      };
    }
  }

  // Build RTI generation prompt
  buildRTIPrompt(query, options) {
    const {
      department,
      location,
      language,
      category,
      userDetails
    } = options;

    const languageInstructions = this.getLanguageInstructions(language);
    
    return `
      You are an expert in Indian Right to Information (RTI) Act 2005. Generate a proper RTI application based on the user's query.

      User Query: "${query}"
      Target Department: ${department}
      Location: ${location}
      Category: ${category}
      Language: ${language}

      ${languageInstructions}

      Please generate a complete RTI application that includes:

      1. Proper heading with department and address
      2. Subject line mentioning RTI Act 2005
      3. Formal salutation
      4. Clear request for information based on the user's query
      5. Specific questions and document requests
      6. Mention of willingness to pay fees
      7. Reference to 30-day response timeline (Section 7(1))
      8. Request for transfer if information not available (Section 6(3))
      9. Proper closing with signature space
      10. Place and date

      User Details (use these for the application):
      Name: ${userDetails.fullName || '[User Name]'}
      Address: ${userDetails.address || '[User Address]'}
      Phone: ${userDetails.phone || '[Phone Number]'}
      Email: ${userDetails.email || '[Email Address]'}

      Make the application:
      - Legally compliant with RTI Act 2005
      - Clear and specific
      - Professional in tone
      - Complete with all necessary elements
      - Easy to understand for government officials

      Return only the formatted RTI application text.
    `;
  }

  // Get language-specific instructions
  getLanguageInstructions(language) {
    const instructions = {
      english: "Write the entire application in English using formal, professional language.",
      hindi: "Write the entire application in Hindi (Devanagari script) using formal, government-style language.",
      bengali: "Write the entire application in Bengali (Bengali script) using formal, professional language.",
      tamil: "Write the entire application in Tamil (Tamil script) using formal, professional language.",
      telugu: "Write the entire application in Telugu (Telugu script) using formal, professional language.",
      marathi: "Write the entire application in Marathi (Devanagari script) using formal, professional language.",
      gujarati: "Write the entire application in Gujarati (Gujarati script) using formal, professional language."
    };
    
    return instructions[language] || instructions.english;
  }

  // Extract language from text response
  extractLanguageFromText(text) {
    const languageMap = {
      'english': ['english', 'en', 'inglish'],
      'hindi': ['hindi', 'हिंदी', 'hindustani'],
      'bengali': ['bengali', 'bangla', 'বাংলা'],
      'tamil': ['tamil', 'தமிழ்'],
      'telugu': ['telugu', 'తెలుగు'],
      'marathi': ['marathi', 'मराठी'],
      'gujarati': ['gujarati', 'ગુજરાતી']
    };

    const lowerText = text.toLowerCase();
    
    for (const [lang, keywords] of Object.entries(languageMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return lang;
      }
    }
    
    return 'english'; // fallback
  }

  // Get language name from code
  getLanguageName(languageCode) {
    const names = {
      'english': 'English',
      'hindi': 'हिंदी (Hindi)',
      'bengali': 'বাংলা (Bengali)',
      'tamil': 'தமிழ் (Tamil)',
      'telugu': 'తెలుగు (Telugu)',
      'marathi': 'मराठी (Marathi)',
      'gujarati': 'ગુજરાતી (Gujarati)'
    };
    
    return names[languageCode] || 'English';
  }

  // Generate RTI from template
  async generateRTIFromTemplate(templateContent, variables = {}) {
    try {
      const prompt = `
        You are generating an RTI application using a template. 
        
        Template Content: ${templateContent}
        
        Variables to substitute: ${JSON.stringify(variables, null, 2)}
        
        Please generate a complete RTI application by:
        1. Replacing all template variables with the provided values
        2. Ensuring the final application is properly formatted
        3. Making sure all legal requirements are met
        4. Keeping the structure and tone professional
        
        Return only the final formatted RTI application.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      return {
        success: true,
        generatedText,
        metadata: {
          templateUsed: true,
          variables,
          model: 'gemini-1.5-flash',
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Error generating RTI from template:', error);
      throw new Error(`Failed to generate RTI from template: ${error.message}`);
    }
  }

  // Improve existing RTI text
  async improveRTIText(rtiText, improvements = []) {
    try {
      const improvementInstructions = improvements.length > 0 
        ? improvements.join(', ')
        : 'Make it more professional, clear, and legally compliant';

      const prompt = `
        Please improve the following RTI application text. 
        
        Current RTI Text: ${rtiText}
        
        Improvements needed: ${improvementInstructions}
        
        Please:
        1. Keep the core content and intent
        2. Improve clarity and professionalism
        3. Ensure legal compliance
        4. Fix any grammatical or structural issues
        5. Maintain the original format
        
        Return only the improved RTI application text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const improvedText = response.text();

      return {
        success: true,
        originalText: rtiText,
        improvedText,
        improvements,
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Error improving RTI text:', error);
      throw new Error(`Failed to improve RTI text: ${error.message}`);
    }
  }

  // Generate clarification questions for missing information
  async generateClarificationQuestions(query, options = {}) {
    const { language = 'english' } = options
    const prompt = `
      You help collect missing details before drafting an RTI. Based on the user's free-text query,
      return a SMALL set (2-5) of targeted questions that gather essential specifics.
      Output STRICT JSON with this exact shape (no prose):
      {
        "questions": [
          {
            "id": "string-id",
            "label": "Human readable question?",
            "placeholder": "Helpful example",
            "type": "text|select",
            "options": ["optional", "for", "select"]
          }
        ]
      }

      Focus on: department/office, location/city, timeframe/period, specific records needed, and any identifiers.
      User query: "${query}"
      Language: ${language}
    `

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    try {
      const parsed = JSON.parse(text)
      if (!parsed || !Array.isArray(parsed.questions)) throw new Error('Invalid questions JSON')
      return { success: true, questions: parsed.questions }
    } catch (e) {
      // Fallback minimal question set
      return {
        success: true,
        questions: [
          { id: 'department', label: 'Which department/office should receive this?', placeholder: 'e.g., Municipal Corporation', type: 'text' },
          { id: 'location', label: 'Which city/region is this about?', placeholder: 'e.g., New Delhi', type: 'text' },
          { id: 'timeframe', label: 'What timeframe should be considered?', placeholder: 'e.g., April 2024 - March 2025', type: 'text' },
          { id: 'documents', label: 'What specific documents/records are needed?', placeholder: 'e.g., invoices, work orders, approvals', type: 'text' },
        ]
      }
    }
  }
}

module.exports = new GeminiService();
