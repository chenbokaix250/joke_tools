import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate a text joke suitable for an 8-year-old girl
export const generateJokeText = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "讲一个适合8岁小女孩听的中文笑话。要求：超级好笑，内容健康，简单易懂，不要太长。直接讲笑话内容，不要任何开场白。",
    });
    return response.text || "哎呀，我想不出笑话了，再试一次吧！";
  } catch (error) {
    console.error("Error generating joke:", error);
    return "笑话迷路了，请检查网络连接！";
  }
};

// Generate speech from text using Gemini TTS
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually a good female voice
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};