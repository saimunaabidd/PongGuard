
import { WeatherData, Language } from "../types";

const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY || 'YOUR_OPEN_WEATHER_API_KEY'; // Placeholder: Assume key is provided via env.

export const fetchCurrentWeather = async (
  lat: number,
  lon: number,
  lang: Language
): Promise<WeatherData | null> => {
  if (!OPEN_WEATHER_API_KEY || OPEN_WEATHER_API_KEY === 'YOUR_OPEN_WEATHER_API_KEY') {
    console.warn("OPEN_WEATHER_API_KEY is not configured. Cannot fetch weather data.");
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=${lang === 'bn' ? 'bn' : 'en'}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      city: data.name,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};