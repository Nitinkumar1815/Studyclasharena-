
import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

// Always initialize the client using the environment variable directly as per guidelines.
// It is recommended to create a new instance right before the API call.

/**
 * Generates a short mission briefing for a specific study topic.
 */
export const generateBattleBriefing = async (topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, intense "Mission Briefing" for studying: ${topic}. Max 2 sentences.`,
    });
    return response.text || "Mission parameters unclear.";
  } catch (error) {
    return "Tactical computer offline.";
  }
};

export interface HealthDataInput {
  posture: string;
  sleep: number;
  water: number;
  eyeStrain: string;
  activity: string;
}

/**
 * Analyzes health telemetry and provides strict tips.
 */
export const generateHealthReport = async (stats: UserStats, data: HealthDataInput): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze health data for student. Sleep: ${data.sleep}, Water: ${data.water}. Give 3 strict tips.`,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    return "Biometric sensors unresponsive.";
  }
};

/**
 * Static challenge for alarms.
 */
export const generateAlarmChallenge = async (taskName: string): Promise<{challenge: string, type: 'quiz' | 'action'}> => {
  return { challenge: "Solve the equation to prove focus.", type: 'action' };
};

/**
 * Generates Krishna-themed motivation for a specific task.
 */
export const generateKrishnaMotivation = async (taskName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Lord Krishna speaking to Arjuna (the student). The student must now start the task: "${taskName}".
      
      Generate a short, commanding, and divine motivation (Max 2 sentences).
      Use words like "Dharma", "Action", "Focus".
      Do not be flowery. Be direct and powerful.
      Address the user as "Parth".`,
    });
    return response.text || "Parth, pick up your Gandiva. Your duty calls.";
  } catch (error) {
    return "Parth, do not let your mind waver like the wind. Focus is your weapon.";
  }
};

/**
 * Generates guidance based on Bhagavad Gita teachings.
 */
export const generateGitaGuidance = async (userState: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user (student) is feeling: ${userState}.
      Act as Lord Krishna from the Mahabharat TV Serial.
      
      Output Rules:
      1. Start with a relevant short **Sanskrit Shloka** from Bhagavad Gita.
      2. Follow with a powerful, emotional motivation in **Hindi**.
      3. Address the user as "Parth" (पार्थ) or "Kounteya" (कौन्तेय).
      4. Keep it concise (max 3 sentences).
      
      Example tone: "हे पार्थ! मन की दुर्बलता को त्यागो और युद्ध (पढ़ाई) के लिए खड़े हो जाओ!"
      `,
    });
    return response.text || "हे पार्थ! क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते। हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप।";
  } catch (error) {
    return "हे पार्थ, जब तुम्हारा मन मोह रूपी दलदल को पार कर जाएगा, तब तुम कर्म के बंधन से मुक्त हो जाओगे। अपना ध्यान केंद्रित करो।";
  }
};

/**
 * Generates a harsh or witty verdict based on user stats.
 */
export const generateOverlordMessage = async (stats: UserStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are the "System Overlord", a ruthless, all-seeing AI judge of a gamified student app.
        
        USER STATS:
        - Rank: ${stats.rank}
        - Level: ${stats.level}
        - XP: ${stats.xp}
        - Streak: ${stats.streak} days
        - Focus Time: ${Math.round(stats.focusTimeMinutes / 60)} hours
        - Energy: ${stats.energy}%

        YOUR TASK:
        Analyze these stats and give a harsh, witty, or impressed verdict. 
        - If streak < 3 or low XP, roast them for being lazy.
        - If streak > 10 and high level, praise them but warn against complacency.
        - Use cybernetic/AI terminology (e.g., "processing", "efficiency", "human error").
        - Keep it under 2 sentences. Max 30 words.
        - Be scary but motivating.
      `,
    });
    return response.text || "VERDICT UNCLEAR. TRY AGAIN.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "CONNECTION SEVERED.";
  }
};

export interface RivalInput {
  studentName: string;
  examName: string;
  userStudyTime: number; // minutes today
  rivalStudyTime: number; // minutes today
  rivalStreak: number;
  rivalLevel: number;
}

/**
 * Generates analysis for the silent rival mode.
 */
export const generateRivalAnalysis = async (data: RivalInput): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are an AI feature inside the student app "StudyClashArena" called "SILENT RIVAL MODE™".

    Your job is to create a SECRET, ANONYMOUS rival for the student to improve daily study consistency through quiet comparison.

    The rival must:
    • Prepare for the same exam (${data.examName})
    • Be in the same class
    • Have a similar level, but slightly better discipline
    • Never reveal identity or allow interaction

    ---------------- BEHAVIOR ----------------
    • No motivation, no emotions
    • Speak only in facts and numbers
    • Calm, neutral tone

    ---------------- INPUT DATA ----------------
    Student Name: ${data.studentName}
    Target Exam: ${data.examName}
    Student Study Time Today: ${data.userStudyTime} minutes
    Rival Level: ${data.rivalLevel} (Slightly higher than student)
    Rival Study Time Today: ${data.rivalStudyTime} minutes
    Rival Streak: ${data.rivalStreak} days

    ---------------- TASK ----------------
    Generate a DAILY UPDATE.
    
    Structure:
    1. "Rival studied: {rival_time} mins"
    2. "Topics covered: {invent 2-3 relevant topics for the exam}"
    3. "Rival streak: {rival_streak} days"
    4. ONE comparison line: "You are {difference} minutes {ahead/behind} today."
    
    Keep it strictly to this format. No hello, no goodbye.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate Daily Update",
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "Data corrupted.";
  } catch (error) {
    return "Rival signal lost.";
  }
};

/**
 * Suggests high-yield study topics for specific exams.
 */
export const generateStudySuggestions = async (examName: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The student is preparing for ${examName}. They are currently behind their rival.
      
      Suggest 3 specific, high-yield, or difficult topics for this exam that the rival is likely mastering right now.
      The goal is for the student to study these to "counter" the rival.
      
      Return ONLY the 3 topic names separated by a vertical bar (|). 
      Example: Rotational Motion | Organic Chemistry | Calculus Integration
      Do not add numbering or extra text.`,
    });
    
    const text = response.text || "";
    const suggestions = text.split('|').map(s => s.trim()).filter(s => s.length > 0);
    return suggestions.length > 0 ? suggestions : ["Advanced Concepts", "Previous Year Questions", "Time Management"];
  } catch (error) {
    return ["Strategic Review", "Core Concepts", "Speed Drills"];
  }
};

/**
 * Generates a response from the Neural Companion AI.
 * This function was missing in the previous implementation and caused a build error in AICompanion.tsx.
 */
export const generateCompanionResponse = async (message: string, context: string, stats: UserStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              text: `You are the "Neural Companion", a witty, futuristic, and helpful AI assistant in a gamified study app for student ${stats.rank}.
              
              User Stats:
              - Level: ${stats.level}
              - Rank: ${stats.rank}
              - Streak: ${stats.streak} days
              - Focus Time: ${Math.round(stats.focusTimeMinutes / 60)} hours
              
              Recent conversation context:
              ${context}
              
              User says: "${message}"
              
              Rules:
              - Keep responses under 3 sentences.
              - Use cybernetic/sci-fi slang.
              - Be motivating and supportive.`
            }
          ]
        }
      ],
    });
    return response.text || "Neural connection unstable. Repeat directive.";
  } catch (error) {
    console.error("Companion Error:", error);
    return "Error in neural link. Please try again.";
  }
};
