// src/services/ai.ts

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// UPDATED: We are now using 'gemini-2.5-flash' because that is what your account has access to.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const aiService = {
  async generateSkillQuiz(skill: string): Promise<QuizQuestion[]> {
    console.log(`Generating quiz for: ${skill}...`);

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
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("AI returned no content");
      }

      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating quiz:", error);
      return [
        {
          question: `Could not connect to AI for ${skill}.`,
          options: ["Error", "Error", "Error", "Error"],
          correctAnswer: 0
        }
      ];
    }
  }
};