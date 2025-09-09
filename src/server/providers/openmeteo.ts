export interface OpenMeteoResponse {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    cloud_cover: number[];
    weather_code: number[];
  };
}

export interface NormalizedHourDetail {
  time: string;
  windSpeed: number;
  windGust: number;
  windDir: number;
  temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  weatherCode: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
  sourceMeta: {
    provider: 'openmeteo';
    enrichedWithRWS?: boolean;
  };
}

export class OpenMeteoProvider {
  private baseUrl = 'https://api.open-meteo.com/v1';

  constructor() {
    // No API key needed for Open-Meteo
  }

  /**
   * Fetch marine weather data for a specific location and time range
   */
  async fetchMarineData(
    lat: number,
    lng: number,
    start: string,
    end: string
  ): Promise<NormalizedHourDetail[]> {
    const startDate = start.split('T')[0];
    const endDate = end.split('T')[0];

    const url = `${this.baseUrl}/forecast?` + new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: 'wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,relative_humidity_2m,precipitation,cloud_cover,weather_code',
      start_date: startDate,
      end_date: endDate
    });

    console.log('🌐 Making request to Open-Meteo:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenMeteoResponse = await response.json();
      
      if (!data.hourly || !data.hourly.time) {
        throw new Error('Invalid response format from Open-Meteo API');
      }

      console.log(`📊 Processing ${data.hourly.time.length} hours from Open-Meteo`);

      return this.normalizeData(data);

    } catch (error) {
      console.error('Open-Meteo API request failed:', error);
      throw error;
    }
  }

  /**
   * Normalize Open-Meteo response to our standard format
   */
  private normalizeData(data: OpenMeteoResponse): NormalizedHourDetail[] {
    const normalizedHours: NormalizedHourDetail[] = [];

    if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) {
      console.log('⚠️ No hourly data received from Open-Meteo API');
      return normalizedHours;
    }

    for (let i = 0; i < data.hourly.time.length; i++) {
      const hour: NormalizedHourDetail = {
        time: data.hourly.time[i],
        windSpeed: 0,
        windGust: 0,
        windDir: 0,
        temperature: null,
        humidity: null,
        precipitation: null,
        cloudCover: null,
        weatherCode: null,
        waveHeight: null,
        waveDirection: null,
        currentSpeed: null,
        currentDirection: null,
        sourceMeta: {
          provider: 'openmeteo'
        }
      };

      // Extract wind speed (10m) - convert from km/h to knots
      if (data.hourly.wind_speed_10m && data.hourly.wind_speed_10m[i] !== null) {
        const kmh = data.hourly.wind_speed_10m[i];
        const knots = kmh * 0.539957; // Convert km/h to knots
        hour.windSpeed = Math.round(knots * 10) / 10;
      }

      // Extract wind gust (10m) - convert from km/h to knots
      if (data.hourly.wind_gusts_10m && data.hourly.wind_gusts_10m[i] !== null) {
        const kmh = data.hourly.wind_gusts_10m[i];
        const knots = kmh * 0.539957; // Convert km/h to knots
        hour.windGust = Math.round(knots * 10) / 10;
      }

      // Extract wind direction (10m)
      if (data.hourly.wind_direction_10m && data.hourly.wind_direction_10m[i] !== null) {
        hour.windDir = Math.round(data.hourly.wind_direction_10m[i]);
      }

      // Extract temperature (2m)
      if (data.hourly.temperature_2m && data.hourly.temperature_2m[i] !== null) {
        hour.temperature = Math.round(data.hourly.temperature_2m[i] * 10) / 10;
      }

      // Extract humidity (2m)
      if (data.hourly.relative_humidity_2m && data.hourly.relative_humidity_2m[i] !== null) {
        hour.humidity = Math.round(data.hourly.relative_humidity_2m[i]);
      }

      // Extract precipitation
      if (data.hourly.precipitation && data.hourly.precipitation[i] !== null) {
        hour.precipitation = Math.round(data.hourly.precipitation[i] * 10) / 10;
      }

      // Extract cloud cover
      if (data.hourly.cloud_cover && data.hourly.cloud_cover[i] !== null) {
        hour.cloudCover = Math.round(data.hourly.cloud_cover[i]);
      }

      // Extract weather code
      if (data.hourly.weather_code && data.hourly.weather_code[i] !== null) {
        hour.weatherCode = data.hourly.weather_code[i];
      }

      // Note: Open-Meteo forecast API doesn't provide marine data
      // Wave height, current speed, etc. will remain null

      normalizedHours.push(hour);
    }

    return normalizedHours;
  }
}
