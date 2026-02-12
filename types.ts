
export type Language = 'en' | 'bn';

export interface WaterReading {
  id: string;
  pondId: string;
  timestamp: number;
  ph: number;
  dissolvedOxygen: number; // ppm
  temperature: number; // Celsius
  salinity: number; // ppt
  ammonia?: number; // ppm
  notes?: string;
}

export interface Pond {
  id: string;
  name: string;
  type: 'shrimp' | 'fish';
  species: string;
  area: number; // in decimals or hectares
  depth: number; // in meters
  stockingDate: string;
  stockingDensity: number; // animals per sqm
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface DailyPlan {
  date: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    time: string;
    completed: boolean;
  }[];
  aiAdvice: string;
}

export interface AppState {
  ponds: Pond[];
  readings: WaterReading[];
  language: Language;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
}

export interface LocationData {
  lat: number;
  lon: number;
}