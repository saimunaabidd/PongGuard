
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Pond, WaterReading, Language, ImageSize, WeatherData } from "../types";

// Helper for image encoding
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDailyPlan = async (pond: Pond, reading: WaterReading | undefined, lang: Language) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Act as an aquaculture expert specialized in Bangladeshi farming conditions. Create a daily plan for a ${pond.type} pond farming ${pond.species}.
      Current details: Stocking Density ${pond.stockingDensity}/sqm, Stocking Date: ${pond.stockingDate}.
      Latest Water Readings: ${reading ? `pH: ${reading.ph}, DO: ${reading.dissolvedOxygen}, Temp: ${reading.temperature}, Salinity: ${reading.salinity}` : 'No recent readings'}.
      Provide the response in ${lang === 'en' ? 'English' : 'Bangla'}.
      Include 4 time-specific tasks (Morning, Noon, Afternoon, Evening) and a summary advice.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["time", "title", "description"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["tasks", "summary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithAssistant = async (query: string, lang: Language, options: { 
  useThinking?: boolean, 
  imagePart?: any,
  useSearch?: boolean,
  weatherData?: WeatherData | null
} = {}) => {
  const ai = getAIInstance();
  const model = 'gemini-3-pro-preview';
  
  const contents: any[] = [];

  if (options.weatherData) {
    contents.push({
      text: `Context: Local weather in ${options.weatherData.city}, Bangladesh is ${options.weatherData.description} at ${options.weatherData.temperature}°C.`
    });
  }

  if (options.imagePart) {
    contents.push(options.imagePart);
  }
  
  contents.push({ text: query });

  const config: any = {
    systemInstruction: `You are PondGuard Assistant Pro, an elite AI specialized in professional aquaculture within the South Asian (specifically Bangladesh) context. 
    Expertise: Bagda, Galda, Rui, Katla, Tilapia, and Pangas farming. Understanding of monsoon patterns and tropical water chemistry.
    Tone: Highly professional, direct, and actionable.
    User language: ${lang === 'en' ? 'English' : 'Bengali'}. Always respond in this language.`
  };

  if (options.useThinking) {
    config.thinkingConfig = { thinkingBudget: 16000 };
  }
  if (options.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const getLocalInsights = async (pond: Pond, lang: Language) => {
  const ai = getAIInstance();
  const lat = pond.location?.lat;
  const lng = pond.location?.lng;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Locate aquaculture feed suppliers, hatcheries, and technical support near ${pond.location?.address || 'Bangladesh'}. Provide regional advice for ${pond.type} (${pond.species}) farming in ${lang === 'en' ? 'English' : 'Bangla'}.`,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: (lat && lng) ? { latitude: lat, longitude: lng } : { latitude: 23.8103, longitude: 90.4125 }
        }
      }
    }
  });

  return {
    text: response.text,
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const generateImage = async (prompt: string, size: ImageSize = '1K') => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `High-quality aquaculture scene in a Bangladeshi pond setting: ${prompt}` }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const textToSpeech = async (text: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
