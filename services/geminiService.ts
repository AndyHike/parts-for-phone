import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PartCondition, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the single item schema structure first
const singlePartSchemaProperties = {
  name: { type: Type.STRING, description: "Short descriptive name of the part in Ukrainian" },
  category: { type: Type.STRING, description: "Category enum value", enum: Object.values(Category) },
  condition: { type: Type.STRING, description: "Condition enum value based on description", enum: Object.values(PartCondition) },
  compatibility: { 
    type: Type.ARRAY, 
    items: { type: Type.STRING },
    description: "List of compatible phone models found in text"
  },
  quantity: { type: Type.INTEGER, description: "Quantity of items if specified, otherwise 1" },
  priceBuy: { type: Type.NUMBER, description: "Purchase price if specified" },
  priceSell: { type: Type.NUMBER, description: "Selling price if specified" },
  description: { type: Type.STRING, description: "Cleaned up description/notes in Ukrainian" },
  sourceInfo: { type: Type.STRING, description: "Any info about origin (donor, client name)" },
};

const partSchema: Schema = {
  type: Type.OBJECT,
  properties: singlePartSchemaProperties,
  required: ["name", "category", "condition", "compatibility"],
};

const multiPartSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: singlePartSchemaProperties,
    required: ["name", "category", "condition"],
  }
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

export const parseMultiplePartsDescription = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this text containing a list of spare parts (dictated via voice) and extract a list of structured data objects. 
      The text may contain multiple items separated by words like 'next', 'also', 'then', or just by context.
      Input text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: multiPartSchema,
        systemInstruction: "You are an assistant for a mobile repair shop. The user will dictate a list of parts. Split them into separate items. If price is mentioned (e.g. 'bought for 100 sold for 200'), extract it. Default quantity is 1."
      },
    });

    if (!response.text) {
        throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini batch parsing error:", error);
    return [];
  }
};