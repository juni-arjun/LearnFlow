// src/services/ai.ts

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const CACHE: { [key: string]: any } = {};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface RoadmapItem {
  skill: string;      // Short name (e.g. "Python")
  title: string;      // Display name (e.g. "Python Programming")
  description: string;
  resource: string;
}

export const aiService = {
  // --- FEATURE 1: SKILL QUIZ ---
  async generateSkillQuiz(skill: string): Promise<QuizQuestion[]> {
    const cacheKey = `quiz_${skill}`;
    if (CACHE[cacheKey]) return CACHE[cacheKey];

    console.log(`Generating NEW quiz for: ${skill}...`);

    const prompt = `
      You are a technical interviewer. Verify if a user knows about "${skill}".
      Generate 3 multiple-choice questions.
      - Conceptual (how it works), not just syntax.
      - Difficulty: Beginner to Intermediate.
      Return ONLY a raw JSON array (no markdown, no code blocks) with this structure:
      [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0
        }
      ]
    `;

    try {
      const result = await this.fetchGemini(prompt);
      CACHE[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("Error generating quiz:", error);
      return [{
        question: `Could not connect to AI for ${skill}.`,
        options: ["Error", "Error", "Error", "Error"],
        correctAnswer: 0
      }];
    }
  },

  // --- FEATURE 2: STANDARD ROADMAP (Optimized) ---
  // We don't need 'currentSkills' anymore because the roadmap is standard for the ROLE.
  async generateRoadmap(role: string): Promise<RoadmapItem[]> {
    
    // OPTIMIZATION: Cache Key is just the role. 
    // "Data Scientist" always returns the same map, regardless of who asks.
    const cacheKey = `roadmap_${role}`;

    if (CACHE[cacheKey]) {
      console.log(`Returning cached STANDARD roadmap for: ${role}`);
      return CACHE[cacheKey];
    }

    console.log(`Generating NEW STANDARD roadmap for: ${role}...`);

    const prompt = `
      You are a senior career mentor. Create a COMPLETE, STANDARD learning roadmap for a "${role}".
      
      Generate a list of 8-10 key skills/technologies representing the full path from Beginner to Job-Ready.
      - Order them logically (Basics -> Advanced).
      - Include both generic skills (e.g. "Python") and specific tools if necessary.
      
      Return ONLY a raw JSON array (no markdown, no code blocks) with this structure:
      [
        {
          "skill": "Short Name", // e.g. "Python" (Used for matching)
          "title": "Display Title", // e.g. "Python for Data Analysis"
          "description": "Why it is essential.",
          "resource": "Search term for tutorials"
        }
      ]
    `;

    try {
      const result = await this.fetchGemini(prompt);
      CACHE[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("Error generating roadmap:", error);
      return [
        { skill: "Basics", title: "Core Fundamentals", description: "Master the basics.", resource: role + " basics" },
        { skill: "Advanced", title: "Advanced Concepts", description: "Deepen your knowledge.", resource: role + " advanced" }
      ];
    }
  },

  async fetchGemini(prompt: string) {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) throw new Error("No content");

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  }
};