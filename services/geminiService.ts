
import { GoogleGenAI } from "@google/genai";

export const analyzeCase = async (characteristics: string, crime: string): Promise<string> => {
  // Fix: Initialize GoogleGenAI using the named parameter apiKey and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza brevemente el siguiente caso legal y genera un resumen ejecutivo profesional en español. 
      Delito: ${crime}
      Características: ${characteristics}`,
      config: {
        temperature: 0.7,
        // Fix: Avoid setting maxOutputTokens without a thinkingBudget for Gemini 3 models
      },
    });

    // Fix: Access response.text as a property
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error al conectar con la IA para el análisis.";
  }
};