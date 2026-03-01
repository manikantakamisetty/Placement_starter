import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyAlvARdomlzLJLkq7urh6DbtexIgeFsCP0" });

export const geminiModel = "gemini-flash-latest";

export async function generateDomainTopics(domains: string[], courses: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Based on these recommended courses:
    ${courses}
    
    List the core technical topics and key concepts for the following domains: ${domains.join(", ")}. 
    Ensure the topics align with the course content provided.
    Format the output as a structured list of topics with sub-concepts. This will be used to build a roadmap.`,
  });
  return response.text;
}

export async function generateRoadmap(domains: string[], topics: string, courses: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Based on these core topics:
    ${topics}
    
    And these recommended courses/resources:
    ${courses}
    
    Generate a detailed 8-week roadmap for learning ${domains.join(" and ")}. 
    Ensure the roadmap aligns with the topics covered in the courses.
    Structure it visually using Markdown tables or clear headers for each week. 
    For each week, include:
    - Main Topic
    - Key Concepts (bullet points)
    - Estimated Difficulty (1-5)
    - Recommended Study Hours
    Make it look like a professional planning document.`,
  });
  return response.text;
}

export async function generateSchedule(roadmap: string, courses: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Convert the following 8-week roadmap into a daily study schedule:
    ${roadmap}
    
    Context from courses:
    ${courses}
    
    For each day, provide a structured timetable:
    - 09:00 - 12:00: Deep Work / Core Concepts (aligned with course modules)
    - 14:00 - 17:00: Practical Implementation / Coding
    - 19:00 - 21:00: Review & Quiz
    
    Adjust the intensity based on the "Estimated Difficulty" and "Study Hours" mentioned in the roadmap. 
    Format as a Markdown table or a clear structured list.`,
  });
  return response.text;
}

export async function generateKeyConcepts(topic: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `List 10 essential key concepts and sub-topics for someone learning "${topic}". 
    Format as a simple bulleted list.`,
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
  const text = response.text || "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse quiz JSON:", text);
    return {};
  }
}

export async function compareCredits(projectCredits: number, contributionCredits: number, developerCredits: number) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Compare these developer metrics: Project Credits (${projectCredits}), Contribution Credits (${contributionCredits}), Developer Credits (${developerCredits}). Provide a brief analysis of the developer's standing.`,
  });
  return response.text;
}

export async function chatWithAI(messages: {role: 'user' | 'model', text: string}[]) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    config: {
      systemInstruction: "You are a helpful career assistant for PlacementPro AI. Help users with career advice, learning paths, and platform features."
    }
  });
  return response.text;
}
