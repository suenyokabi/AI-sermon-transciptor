
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, Theme } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            enum: ['SCRIPTURE', 'QUOTE', 'NOTHING_FOUND'],
            description: "Categorize the input. Use SCRIPTURE if a bible reference is found. Use QUOTE if no scripture is found but there's a meaningful quote. Use NOTHING_FOUND otherwise."
        },
        reference: {
            type: Type.STRING,
            description: "The full biblical reference, e.g., 'John 3:16-17'. Only provide if type is SCRIPTURE.",
            nullable: true,
        },
        quote: {
            type: Type.STRING,
            description: "A short, impactful quote from the sermon. Only provide if type is QUOTE.",
            nullable: true,
        },
        theme: {
            type: Type.STRING,
            enum: Object.values(Theme),
            description: "The emotional or theological tone of the scripture or quote."
        },
        confidence: {
            type: Type.NUMBER,
            description: "Confidence score (0.0 to 1.0) for the scripture reference detection. Only for SCRIPTURE type."
        }
    },
    required: ['type', 'theme']
};

export const analyzeTranscript = async (transcript: string): Promise<GeminiAnalysisResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze the following sermon transcript. Your task is to identify any biblical scriptures mentioned, whether as direct quotes, paraphrases, or story references. If you find a scripture, provide the reference. If no scripture is clearly identified, extract one short, powerful, and meaningful quote from the latter part of the sermon.

            Transcript: "${transcript}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text;
        const result = JSON.parse(jsonText) as GeminiAnalysisResult;
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};
