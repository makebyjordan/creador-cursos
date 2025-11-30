import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PillarTopic, LessonVariation, Course, GeminiResponse, GroundingSource, TokenUsage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from markdown code blocks if necessary
const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  try {
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    throw new Error("La respuesta del modelo no tuvo el formato esperado. Inténtalo de nuevo.");
  }
};

export const generatePillars = async (topic: string, onUsage?: (usage: TokenUsage) => void): Promise<GeminiResponse<PillarTopic[]>> => {
  const prompt = `
    Actúa como un mentor experto en creación de cursos online.
    El usuario quiere crear un curso sobre: "${topic}".
    Usa Google Search para encontrar tendencias actuales, subtemas populares y necesidades del mercado relacionadas con este tema en español.
    
    Genera 10 "Temas Pilar" (Pillar Topics) distintos y relevantes que podrían servir como base para una estrategia de contenido amplia.
    
    Devuelve la respuesta ESTRICTAMENTE en el siguiente formato JSON dentro de un bloque de código:
    \`\`\`json
    [
      {
        "id": "1",
        "title": "Título del Pilar",
        "description": "Breve descripción de qué trata este pilar."
      },
      ...
    ]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    if (response.usageMetadata && onUsage) {
      onUsage({
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        responseTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      });
    }

    const text = response.text || "";
    const data = extractJson(text);
    
    // Extract grounding metadata
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      });
    }

    return { data, sources };
  } catch (error) {
    console.error("Error generating pillars:", error);
    throw error;
  }
};

export const generateVariations = async (pillar: PillarTopic, onUsage?: (usage: TokenUsage) => void): Promise<LessonVariation[]> => {
  const prompt = `
    Como mentor experto, el usuario ha seleccionado el Pilar Temático: "${pillar.title}" (${pillar.description}).
    Genera 10 "Variaciones de Lección" específicas y atractivas para este pilar.
    Deben cubrir diferentes ángulos (ej. práctico, teórico, caso de estudio, "paso a paso", errores comunes).
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING, description: "Título atractivo de la lección" },
        objective: { type: Type.STRING, description: "Lo que el estudiante aprenderá" },
        difficulty: { type: Type.STRING, enum: ["Principiante", "Intermedio", "Avanzado"] },
      },
      required: ["id", "title", "objective", "difficulty"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.usageMetadata && onUsage) {
      onUsage({
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        responseTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      });
    }

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating variations:", error);
    throw error;
  }
};

export const generateCourse = async (variation: LessonVariation, onUsage?: (usage: TokenUsage) => void): Promise<Course> => {
  const prompt = `
    Crea un CURSO COMPLETO Y DETALLADO para la lección: "${variation.title}".
    Objetivo: "${variation.objective}".
    Dificultad: "${variation.difficulty}".

    El curso debe estar estructurado en 4-6 módulos (bloques).
    Cada módulo debe tener:
    1. Título claro.
    2. Contenido educativo extenso en formato Markdown (usa negritas, listas, subtítulos). El tono debe ser de mentor amigable pero experto.
    3. Una palabra clave EN INGLÉS para buscar una imagen representativa (ej. "computer", "meeting", "code").
    4. Un quiz de 2 preguntas tipo test para comprobar el aprendizaje.
    5. OPCIONAL: Si el contenido se explica mejor con datos, incluye un gráfico simple (chartData) con 3-5 puntos de datos.

    También elige un tema de color general para el curso.
  `;

  // Schema for complex course structure
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      themeColor: { type: Type.STRING, enum: ['blue', 'indigo', 'emerald', 'rose', 'amber', 'violet'] },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            contentMarkdown: { type: Type.STRING },
            imageKeyword: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            },
            chartData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              nullable: true // Allow null if no chart needed
            }
          },
          required: ["id", "title", "contentMarkdown", "imageKeyword", "quiz"]
        }
      }
    },
    required: ["title", "subtitle", "themeColor", "modules"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.usageMetadata && onUsage) {
      onUsage({
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        responseTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      });
    }

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};