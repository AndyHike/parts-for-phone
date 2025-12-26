import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PartCondition, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const partSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Short descriptive name of the part in Ukrainian" },
    category: { type: Type.STRING, description: "Category enum value", enum: Object.values(Category) },
    condition: { type: Type.STRING, description: "Condition enum value based on description", enum: Object.values(PartCondition) },
    compatibility: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of compatible phone models found in text"
    },
    description: { type: Type.STRING, description: "Cleaned up description/notes in Ukrainian" },
    sourceInfo: { type: Type.STRING, description: "Any info about origin (donor, client name)" },
  },
  required: ["name", "category", "condition", "compatibility"],
};

export const parsePartDescription = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this text describing a mobile phone spare part and extract structured data. 
      Input text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: partSchema,
        systemInstruction: "You are an assistant for a mobile repair shop. You categorize spare parts. Interpret 'знятий', 'ориг', 'бу' as used conditions. Default to OTHER category if unsure."
      },
    });

    if (!response.text) {
        throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini parsing error:", error);
    return null;
  }
};