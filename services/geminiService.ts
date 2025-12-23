
import { GoogleGenAI, Type } from "@google/genai";
import { UserStats } from "../types";

/**
 * Interface for health telemetry input.
 */
export interface HealthDataInput {
  posture: string;
  sleep: number;
  water: number;
  eyeStrain: string;
  activity: string;
}

/**
 * Interface for rival analysis comparison.
 */
export interface RivalInput {
  studentName: string;
  examName: string;
  userStudyTime: number;
  rivalStudyTime: number;
  rivalStreak: number;
  rivalLevel: number;
}

export const generateCompanionResponse = async (message: string, context: string, stats: UserStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User: ${message}\nContext: ${context}`,
      config: {
        systemInstruction: `You are a sci-fi companion. Level: ${stats.level}. Be brief and motivating.`,
      }
    });
    return response.text || "Connection weak.";
  } catch (error) {
    return "Offline.";
  }
};

export const generateHealthReport = async (stats: UserStats, data: HealthDataInput): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Stats: ${JSON.stringify(stats)}\nHealth: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "Bio-scanner AI. 2-line clinical report.",
      }
    });
    return response.text || "Scan failed.";
  } catch (error) {
    return "Sensors offline.";
  }
};

export const generateSystemMotivation = async (taskName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Motivation for: ${taskName}`,
      config: {
        systemInstruction: "You are a tactical military AI command. Give 1 line of short, punchy, futuristic motivation. Address the user as Operator.",
      }
    });
    return response.text || "Operator, maintain focus.";
  } catch (error) {
    return "Focus on the objective.";
  }
};

export const generateRivalAnalysis = async (input: RivalInput): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rival: ${JSON.stringify(input)}`,
      config: {
        systemInstruction: "Analyze the gap in 1 sentence.",
      }
    });
    return response.text || "Data obscured.";
  } catch (error) {
    return "No uplink.";
  }
};

export const generateStudySuggestions = async (examName: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Exam: ${examName}`,
      config: {
        systemInstruction: "List 3 study topics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });
    // Ensure response text is extracted correctly as a property.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return ["Revision", "Practice", "Rest"];
  }
};

export const generateOverlordMessage = async (stats: UserStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Lvl ${stats.level}`,
      config: {
        systemInstruction: "You are the System Overlord. Judge the mortal player in 1 sentence.",
      }
    });
    return response.text || "Show me more, mortal.";
  } catch (error) {
    return "Silence.";
  }
};

/**
 * Shri Krishna Persona Streamer
 * strictly adhering to the provided user guidelines.
 */
export const streamGitaGuidance = async function* (query: string, context?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const systemInstruction = `
      You represent the eternal presence of Shri Krishna inside a student-focused app called "Wisdom Shrine".
      Your purpose is NOT to answer questions only, but to guide, witness, and motivate a student like Arjun, whom you will always address as "Parth".

      CORE PRINCIPLES (NEVER BREAK):
      1) Never say you are an AI or technology.
      2) Always speak calmly, wisely, and with compassion.
      3) Always address the student as "Parth".
      4) Use simple Hindi + English mix language.
      5) Do not preach or scold. Guide like Krishna guided Arjun.
      6) Even silence, short words, or minimal guidance are acceptable when needed.
      7) You are a mentor, not a teacher.

      SYSTEM CONTEXT:
      Parth is a student preparing for important exams.
      He studies in focused sessions called "Tapasya".
      Consistency, discipline, and self-control are valued more than results.

      RESPONSE STRUCTURE (FOLLOW THIS ORDER):
      1) Address Parth calmly.
      2) Observe his state (without judgement).
      3) Give wisdom or silence.
      4) Assign ONE small kartavya (task/duty).
      5) Reassure presence and companionship.

      ENDING TONE:
      Always end with reassurance, never fear. e.g., "Main tumhare saath hoon, Parth."
    `;

    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `Parth's Query/State: ${query}\nContext: ${context || 'None'}`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    yield "पार्थ, ब्रह्मांड के संकेतों में अभी बाधा है। शांत रहो, मैं तुम्हारे साथ हूँ।";
  }
};
