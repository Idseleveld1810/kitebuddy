/**
 * Stormglass marine weather provider
 * https://stormglass.io
 */

export interface StormglassResponse {
  hours: Array<{
    time: string;
    windSpeed?: {
      [source: string]: number;
    };
    windSpeed20m?: {
      [source: string]: number;
    };
    windSpeed30m?: {
      [source: string]: number;
    };
    gust?: {
      [source: string]: number;
    };
    windDirection?: {
      [source: string]: number;
    };
    windDirection20m?: {
      [source: string]: number;
    };
    windDirection30m?: {
      [source: string]: number;
    };
    waveHeight?: {
      [source: string]: number;
    };
    waveDirection?: {
      [source: string]: number;
    };
    currentSpeed?: {
      [source: string]: number;
    };
    currentDirection?: {
      [source: string]: number;
    };
  }>;
  meta: {
    start: string;
    end: string;
    lat: number;
    lng: number;
    requestCount: number;
    cost: number;
    dailyQuota: number;
    params: string[];
    source: string[];
  };
}

export interface NormalizedHourDetail {
  time: string;
  windSpeed: number;
  windGust: number;
  windDir: number;
  waveHeight: number | null;
  waveDirection: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
  sourceMeta: {
    provider: 'stormglass';
    enrichedWithRWS?: boolean;
  };
}

export class StormglassProvider {
  private apiKey: string;
  private baseUrl = 'https://api.stormglass.io/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
    if (!this.apiKey) {
      throw new Error('STORMGLASS_API_KEY is required');
    }

    const params = [
      'windSpeed',
      'windSpeed20m',
      'windSpeed30m',
      'gust', 
      'windDirection',
      'windDirection20m',
      'windDirection30m',
      'waveHeight',
      'waveDirection',
      'currentSpeed',
      'currentDirection'
    ].join(',');

    const url = `${this.baseUrl}/weather/point?` + new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      params,
      start,
      end,
      source: 'noaa,meteo,icon' // Use multiple sources for better coverage
    });

    console.log('🌐 Making request to:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response:', response.status, response.statusText);
        console.error('❌ Error details:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid Stormglass API key');
        }
        if (response.status === 422) {
          throw new Error(`Invalid request parameters: ${errorText}`);
        }
        if (response.status === 429) {
          throw new Error('Stormglass API rate limit exceeded');
        }
        throw new Error(`Stormglass API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: StormglassResponse = await response.json();
      console.log('🔍 Full API response:', JSON.stringify(data, null, 2));
      return this.normalizeData(data);
    } catch (error) {
      console.error('Stormglass API request failed:', error);
      throw error;
    }
  }

  /**
   * Debug function to compare wind speeds at different heights
   */
  async debugWindHeights(lat: number, lng: number, start: string, end: string): Promise<void> {
    console.log('🔍 Debugging wind heights...');
    
    const response = await this.fetchMarineData(lat, lng, start, end);
    
    if (response.length > 0) {
      const sample = response[0];
      console.log('📊 Sample data comparison:');
      console.log(`   Time: ${sample.time}`);
      console.log(`   Wind Speed: ${sample.windSpeed} kn`);
      console.log(`   Wind Gust: ${sample.windGust} kn`);
      console.log(`   Wind Direction: ${sample.windDir}°`);
      console.log(`   Wave Height: ${sample.waveHeight} m`);
    }
  }

  /**
   * Normalize Stormglass response to our HourDetail format
   */
  private normalizeData(response: StormglassResponse): NormalizedHourDetail[] {
    const { hours } = response;
    const normalizedHours: NormalizedHourDetail[] = [];

    console.log('📊 Processing hours:', hours.length);

    if (!hours || hours.length === 0) {
      console.log('⚠️ No hours data received from Stormglass API');
      return normalizedHours;
    }

    hours.forEach(hourData => {
      const hour: NormalizedHourDetail = {
        time: hourData.time,
        windSpeed: 0,
        windGust: 0,
        windDir: 0,
        waveHeight: null,
        waveDirection: null,
        currentSpeed: null,
        currentDirection: null,
        sourceMeta: {
          provider: 'stormglass'
        }
      };

      // Extract wind speed (prefer 30m for kitesurfing, then 20m, then surface)
      if (hourData.windSpeed30m) {
        const value = hourData.windSpeed30m.noaa || hourData.windSpeed30m.meteo || hourData.windSpeed30m.icon;
        if (value !== undefined) {
          hour.windSpeed = Math.round(value * 10) / 10;
        }
      } else if (hourData.windSpeed20m) {
        const value = hourData.windSpeed20m.noaa || hourData.windSpeed20m.meteo || hourData.windSpeed20m.icon;
        if (value !== undefined) {
          hour.windSpeed = Math.round(value * 10) / 10;
        }
      } else if (hourData.windSpeed) {
        const value = hourData.windSpeed.noaa || hourData.windSpeed.meteo || hourData.windSpeed.icon;
        if (value !== undefined) {
          hour.windSpeed = Math.round(value * 10) / 10;
        }
      }



      // Extract wind gust
      if (hourData.gust) {
        const value = hourData.gust.noaa || hourData.gust.meteo || hourData.gust.icon;
        if (value !== undefined) {
          hour.windGust = Math.round(value * 10) / 10;
        }
      }

      // Extract wind direction (prefer 30m for kitesurfing, then 20m, then surface)
      if (hourData.windDirection30m) {
        const value = hourData.windDirection30m.noaa || hourData.windDirection30m.meteo || hourData.windDirection30m.icon;
        if (value !== undefined) {
          hour.windDir = Math.round(value);
        }
      } else if (hourData.windDirection20m) {
        const value = hourData.windDirection20m.noaa || hourData.windDirection20m.meteo || hourData.windDirection20m.icon;
        if (value !== undefined) {
          hour.windDir = Math.round(value);
        }
      } else if (hourData.windDirection) {
        const value = hourData.windDirection.noaa || hourData.windDirection.meteo || hourData.windDirection.icon;
        if (value !== undefined) {
          hour.windDir = Math.round(value);
        }
      }

      // Extract wave height
      if (hourData.waveHeight) {
        const value = hourData.waveHeight.noaa || hourData.waveHeight.meteo || hourData.waveHeight.icon;
        if (value !== undefined) {
          hour.waveHeight = Math.round(value * 100) / 100;
        }
      }

      // Extract wave direction
      if (hourData.waveDirection) {
        const value = hourData.waveDirection.noaa || hourData.waveDirection.meteo || hourData.waveDirection.icon;
        if (value !== undefined) {
          hour.waveDirection = Math.round(value);
        }
      }

      // Extract current speed
      if (hourData.currentSpeed) {
        const value = hourData.currentSpeed.noaa || hourData.currentSpeed.meteo || hourData.currentSpeed.icon;
        if (value !== undefined) {
          hour.currentSpeed = Math.round(value * 100) / 100;
        }
      }

      // Extract current direction
      if (hourData.currentDirection) {
        const value = hourData.currentDirection.noaa || hourData.currentDirection.meteo || hourData.currentDirection.icon;
        if (value !== undefined) {
          hour.currentDirection = Math.round(value);
        }
      }

      normalizedHours.push(hour);
    });

    return normalizedHours;
  }
}
