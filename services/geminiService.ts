
import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";
import { MARA_SYSTEM_INSTRUCTION } from "../constants";
import { DailyLog, ChatMessage, ToxicAnalysis } from "../types";
import { saveToxicAnalysis } from "./storageService";

let chatSession: Chat | null = null;

const saveToxicAnalysisDeclaration: FunctionDeclaration = {
  name: 'saveToxicAnalysis',
  parameters: {
    type: Type.OBJECT,
    description: 'Saves the result of a deep toxicity analysis.',
    properties: {
      gaslighting_score: { type: Type.NUMBER, description: '0 to 100' },
      control_score: { type: Type.NUMBER, description: '0 to 100' },
      volatility_score: { type: Type.NUMBER, description: '0 to 100' },
      summary_text: { type: Type.STRING, description: 'Maras gentle summary of the patterns found' },
      urgency_level: { type: Type.STRING, enum: ["low", "medium", "high", "critical"], description: 'The level of concern' }
    },
    required: ['gaslighting_score', 'control_score', 'volatility_score', 'summary_text', 'urgency_level'],
  },
};

const getAIClient = () => {
  // Always use a named parameter with process.env.API_KEY directly for initialization.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = (logs: DailyLog[], existingHistory: ChatMessage[]) => {
  const ai = getAIClient();
  const recentLogs = logs.slice(0, 5).map(l => 
    `Date: ${l.date}, Mood: ${l.rating}/10, Energy: ${l.energy}, RedFlag: ${l.redFlag}, Note: ${l.note}`
  ).join('\n');

  const systemPrompt = `${MARA_SYSTEM_INSTRUCTION}\n\nUser Context Logs:\n${recentLogs}`;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: [saveToxicAnalysisDeclaration] }],
    },
    history: existingHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  });
};

export const sendMessageToMara = async (message: string, onUpdateAnalysis?: () => void): Promise<string> => {
  if (!chatSession) throw new Error("Chat not initialized");

  try {
    const result = await chatSession.sendMessage({ message });
    
    // Check for tool calls directly on the response object
    if (result.functionCalls) {
      for (const call of result.functionCalls) {
        if (call.name === 'saveToxicAnalysis') {
          const analysis = call.args as any as ToxicAnalysis;
          analysis.timestamp = Date.now();
          saveToxicAnalysis(analysis);
          if (onUpdateAnalysis) onUpdateAnalysis();
          
          // Inform model tool was executed via chat interface
          await chatSession.sendMessage({ 
            message: "TOOL_RESPONSE: Toxic Analysis has been saved successfully to the user's dashboard." 
          });
        }
      }
    }
    
    // Access the text property directly (not a method call) as per GenerateContentResponse guidelines
    return result.text || "I'm listening...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm feeling a bit foggy right now. Let's try again in a moment.";
  }
};
