export interface WeatherInfo {
  temp: number;
  description: string;
  windSpeed: number;
  windDeg: number;
  icon: string;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherInfo | null> {
  // Using OpenWeatherMap free tier (requires API key, but we can use a mock or a free alternative if available)
  // For now, let's use a mock or a free alternative like Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API error');
    
    const data = await response.json();
    const current = data.current_weather;
    
    return {
      temp: current.temperature,
      description: 'Clear', // Open-Meteo doesn't give text descriptions easily, we'd need to map weather codes
      windSpeed: current.windspeed,
      windDeg: current.winddirection,
      icon: '01d', // Mock icon
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return null;
  }
}
