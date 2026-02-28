import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";

export async function generateRoadmap(domain: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a detailed 8-week roadmap for learning ${domain}. Format it as a week-by-week guide with specific topics and goals for each week. Use Markdown.`,
  });
  return response.text;
}

export async function generateSchedule(domain: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a daily 8-week study schedule for ${domain}. Include morning, afternoon, and evening sessions. Use Markdown.`,
  });
  return response.text;
}

export async function generateCourses(domains: string[]) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `List 5 high-quality, latest online courses for ${domains.join(", ")}. Include course name, platform, and a brief description. Use Markdown.`,
  });
  return response.text;
}

export async function generateJobOpenings(domain: string, address: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Find and list 5 recent job openings for ${domain} near ${address}. If real-time data is limited, provide typical roles and companies in that area. Use Markdown.`,
  });
  return response.text;
}

export async function generateLinkedInPortfolio(userType: string, domain: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Create a professional LinkedIn portfolio summary and experience section for a ${userType} in ${domain}. Make it compelling and keyword-optimized. Use Markdown.`,
  });
  return response.text;
}

export async function generateQuizQuestion(domain: string, language: string, level: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a ${level} level coding question in ${language} related to ${domain}. Include the problem statement and a hidden solution. Format as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          solution: { type: Type.STRING },
          credits: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function compareCredits(projectCredits: number, contributionCredits: number, developerCredits: number) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Compare these developer metrics: Project Credits (${projectCredits}), Contribution Credits (${contributionCredits}), Developer Credits (${developerCredits}). Provide a brief analysis of the developer's standing.`,
  });
  return response.text;
}
