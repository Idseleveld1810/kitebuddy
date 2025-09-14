import type { APIRoute } from 'astro';
import spots from '../../data/spots_with_wind_top50.json';

// Simple Open-Meteo API client
class OpenMeteoProvider {
  private baseUrl = 'https://api.open-meteo.com/v1';

  async fetchMarineData(lat: number, lng: number, startDate: string, endDate: string) {
    const url = `${this.baseUrl}/forecast?` + new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: 'wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,relative_humidity_2m,precipitation,cloud_cover,weather_code',
      start_date: startDate.split('T')[0],
      end_date: endDate.split('T')[0]
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeData(data);
  }

  private normalizeData(data: any) {
    const hours = [];
    
    for (let i = 0; i < data.hourly.time.length; i++) {
      const hour = {
        time: data.hourly.time[i],
        windSpeed: Math.round((data.hourly.wind_speed_10m[i] * 0.539957) * 10) / 10, // km/h to knots
        windGust: Math.round((data.hourly.wind_gusts_10m[i] * 0.539957) * 10) / 10, // km/h to knots
        windDir: Math.round(data.hourly.wind_direction_10m[i]),
        temperature: Math.round(data.hourly.temperature_2m[i] * 10) / 10,
        humidity: Math.round(data.hourly.relative_humidity_2m[i]),
        precipitation: Math.round(data.hourly.precipitation[i] * 10) / 10,
        cloudCover: Math.round(data.hourly.cloud_cover[i]),
        weatherCode: data.hourly.weather_code[i],
        waveHeight: null,
        waveDirection: null,
        currentSpeed: null,
        currentDirection: null,
        sourceMeta: {
          provider: 'openmeteo'
        }
      };
      hours.push(hour);
    }
    
    return hours;
  }
}


export const GET: APIRoute = async ({ url }) => {
  try {
    const { searchParams } = new URL(url);
    const spotId = searchParams.get('spotId');

    if (!spotId) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: spotId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the spot
    const spot = spots.find(s => s.spotId === spotId);
    if (!spot) {
      return new Response(JSON.stringify({
        error: `Spot not found: ${spotId}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Open-Meteo provider
    const provider = new OpenMeteoProvider();

    // Calculate time range for the next 7 days
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    const start = startDate.toISOString();
    const end = endDate.toISOString();

    // Use original spot coordinates
    const marineData = await provider.fetchMarineData(
      spot.latitude,
      spot.longitude,
      start,
      end
    );

    // Group data by day of the week
    const weekdays = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    const forecastData: { [key: string]: any[] } = {};

    weekdays.forEach(day => {
      forecastData[day] = [];
    });

    // Filter and group data by day
    marineData.forEach(hour => {
      const hourTime = new Date(hour.time);
      const hourOfDay = hourTime.getHours();
      
      // Only include kitesurfing hours (6:00-22:00)
      if (hourOfDay >= 6 && hourOfDay <= 22) {
        const dayOfWeek = weekdays[hourTime.getDay()];
        
        // Format time for display and map to expected format
        const formattedHour = {
          time: hourTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          speed: hour.windSpeed,
          gust: hour.windGust,
          dir: hour.windDir,
          temperature: hour.temperature,
          humidity: hour.humidity,
          rain: hour.precipitation || 0,
          cloudCover: hour.cloudCover,
          weatherCode: hour.weatherCode,
          waveHeight: hour.waveHeight,
          sourceMeta: hour.sourceMeta
        };

        forecastData[dayOfWeek].push(formattedHour);
      }
    });

    return new Response(JSON.stringify({
      spot: {
        id: spot.spotId,
        name: spot.name,
        latitude: spot.latitude,
        longitude: spot.longitude
      },
      forecast: forecastData,
      source: 'openmeteo',
      generated: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API error:', error);
    
    let status = 500;
    let message = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('Invalid Stormglass API key')) {
        status = 401;
        message = 'Invalid Stormglass API key';
      } else if (error.message.includes('rate limit')) {
        status = 429;
        message = 'API rate limit exceeded';
      } else if (error.message.includes('not configured')) {
        status = 503;
        message = error.message;
      }
    }

    return new Response(JSON.stringify({
      error: message
    }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
