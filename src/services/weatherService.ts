/**
 * Weather Service - Integrates with Open-Meteo API
 * Provides: Current weather, historical data, and 7-day forecast for Denmark
 * No API key required - free and open source
 */

export interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
  description: string;
  time: string;
}

export interface LocationWeather {
  latitude: number;
  longitude: number;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
  weatherCode?: number;
  forecast: WeatherData[];
  lastUpdated: string;
}

// WMO Weather interpretation codes
const WMO_CODES: { [key: number]: string } = {
  0: '☀️ Clear sky',
  1: '🌤️ Mainly clear',
  2: '⛅ Partly cloudy',
  3: '☁️ Overcast',
  45: '🌫️ Foggy',
  48: '🌫️ Frosting fog',
  51: '🌧️ Light drizzle',
  53: '🌧️ Moderate drizzle',
  55: '🌧️ Dense drizzle',
  61: '🌧️ Slight rain',
  63: '🌧️ Moderate rain',
  65: '⛈️ Heavy rain',
  71: '❄️ Slight snow',
  73: '❄️ Moderate snow',
  75: '❄️ Heavy snow',
  77: '❄️ Snow grains',
  80: '🌧️ Slight rain showers',
  81: '🌧️ Moderate rain showers',
  82: '⛈️ Violent rain showers',
  85: '❄️ Slight snow showers',
  86: '❄️ Heavy snow showers',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm with hail',
  99: '⛈️ Thunderstorm with hail',
};

export class WeatherService {
  private static baseUrl = 'https://api.open-meteo.com/v1';
  private static cache = new Map<string, { data: LocationWeather; timestamp: number }>();
  private static cacheExpiry = 30 * 60 * 1000; // 30 minutes

  /**
   * Get current weather and 7-day forecast for a location
   */
  static async getWeatherForLocation(
    latitude: number,
    longitude: number
  ): Promise<LocationWeather | null> {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Get current + 7-day forecast
      const response = await fetch(
        `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Copenhagen`
      );

      if (!response.ok) throw new Error('Weather API request failed');

      const data = await response.json();
      const current = data.current;

      // Format 7-day forecast
      const forecast: WeatherData[] = (data.daily.time || []).map((time: string, index: number) => ({
        temperature: data.daily.temperature_2m_max[index],
        humidity: 0,
        weatherCode: data.daily.weather_code[index],
        windSpeed: 0,
        precipitation: data.daily.precipitation_sum[index] || 0,
        feelsLike: data.daily.temperature_2m_max[index],
        description: this.getWeatherDescription(data.daily.weather_code[index]),
        time,
      }));

      const result: LocationWeather = {
        latitude,
        longitude,
        temperature: current.temperature_2m,
        description: this.getWeatherDescription(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation || 0,
        feelsLike: current.apparent_temperature,
        weatherCode: current.weather_code,
        forecast,
        lastUpdated: new Date().toISOString(),
      };

      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return null;
    }
  }

  /**
   * Get historical weather data for a location
   */
  static async getHistoricalWeather(
    latitude: number,
    longitude: number,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  ): Promise<WeatherData[] | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe/Copenhagen`
      );

      if (!response.ok) throw new Error('Historical weather API request failed');

      const data = await response.json();

      const history: WeatherData[] = (data.daily.time || []).map((time: string, index: number) => ({
        temperature: data.daily.temperature_2m_max[index],
        humidity: 0,
        weatherCode: data.daily.weather_code[index],
        windSpeed: 0,
        precipitation: data.daily.precipitation_sum[index] || 0,
        feelsLike: data.daily.temperature_2m_max[index],
        description: this.getWeatherDescription(data.daily.weather_code[index]),
        time,
      }));

      return history;
    } catch (error) {
      console.error('Failed to fetch historical weather:', error);
      return null;
    }
  }

  /**
   * Get weather for multiple locations (useful for all active orders)
   */
  static async getWeatherForMultipleLocations(
    locations: Array<{ latitude: number; longitude: number; id: string }>
  ): Promise<Map<string, LocationWeather>> {
    const results = new Map<string, LocationWeather>();

    // Fetch in parallel with a limit to avoid overwhelming the API
    const promises = locations.map((loc) =>
      this.getWeatherForLocation(loc.latitude, loc.longitude).then((weather) => {
        if (weather) {
          results.set(loc.id, weather);
        }
      })
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * Convert WMO weather code to human-readable description
   */
  private static getWeatherDescription(code: number): string {
    return WMO_CODES[code] || '🌤️ Unknown conditions';
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get weather data for Denmark's major regions (useful for regional overview)
   */
  static async getRegionalWeather(): Promise<Map<string, LocationWeather>> {
    const regions = [
      { latitude: 56.26, longitude: 9.5, id: 'central' }, // Central Denmark
      { latitude: 57.05, longitude: 9.85, id: 'north' }, // North Jutland
      { latitude: 55.45, longitude: 12.3, id: 'east' }, // East (Copenhagen area)
      { latitude: 54.57, longitude: 8.65, id: 'south' }, // South Jutland
    ];

    return this.getWeatherForMultipleLocations(regions);
  }

  /**
   * Get weather alerts based on conditions (wind, rain, etc.)
   */
  static getWeatherAlerts(weather: LocationWeather): string[] {
    const alerts: string[] = [];

    if (weather.windSpeed > 15) {
      alerts.push(`⚠️ Strong winds: ${weather.windSpeed.toFixed(1)} km/h`);
    }

    if (weather.precipitation > 5) {
      alerts.push(`⚠️ Heavy rain: ${weather.precipitation.toFixed(1)} mm`);
    }

    if (weather.temperature < 0) {
      alerts.push(`❄️ Freezing: ${weather.temperature.toFixed(1)}°C`);
    }

    if (weather.weatherCode && weather.weatherCode >= 80 && weather.weatherCode <= 99) {
      alerts.push('⛈️ Thunderstorm risk');
    }

    return alerts;
  }
}
