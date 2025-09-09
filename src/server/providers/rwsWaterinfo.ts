/**
 * Rijkswaterstaat Waterinfo provider
 * https://waterwebservices.rijkswaterstaat.nl/
 */

export interface RWSResponse {
  value: string;
  dateTime: string;
  location: string;
  parameter: string;
}

export interface RWSLocation {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  parameter: string;
}

export interface NormalizedRWSData {
  time: string;
  currentSpeed: number | null;
  currentDirection: number | null;
  waterTemperature: number | null;
  sourceMeta: {
    provider: 'rws';
    location: string;
  };
}

export class RWSWaterinfoProvider {
  private baseUrl = 'https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGEN/';

  /**
   * Get nearest RWS station for a given location
   */
  private getNearestStation(lat: number, lng: number): RWSLocation | null {
    // RWS stations along Dutch coast with current measurements
    const stations: RWSLocation[] = [
      {
        locationId: 'VLISSGN',
        name: 'Vlissingen',
        latitude: 51.4425,
        longitude: 3.5967,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'ROOMPBTN',
        name: 'Roompot Buiten',
        latitude: 51.6250,
        longitude: 3.6750,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'ROOMPBNN',
        name: 'Roompot Binnen',
        latitude: 51.6250,
        longitude: 3.6750,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'HARVT10',
        name: 'Hoek van Holland',
        latitude: 51.9983,
        longitude: 4.1200,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'IJMDBTHVN',
        name: 'IJmuiden Buitenhaven',
        latitude: 52.4633,
        longitude: 4.5550,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'DENHDR',
        name: 'Den Helder',
        latitude: 52.9633,
        longitude: 4.7450,
        parameter: 'STROOMSnelheid'
      },
      {
        locationId: 'HARVT10',
        name: 'Harlingen',
        latitude: 53.1750,
        longitude: 5.4083,
        parameter: 'STROOMSnelheid'
      }
    ];

    // Find nearest station
    let nearest: RWSLocation | null = null;
    let minDistance = Infinity;

    for (const station of stations) {
      const distance = this.calculateDistance(lat, lng, station.latitude, station.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = station;
      }
    }

    // Only return if within 50km
    return minDistance <= 50 ? nearest : null;
  }

  /**
   * Calculate distance between two points in km
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Fetch current data and short-term forecast from RWS
   */
  async fetchCurrentData(lat: number, lng: number): Promise<NormalizedRWSData | null> {
    try {
      const station = this.getNearestStation(lat, lng);
      if (!station) {
        console.log('No RWS station found within 50km');
        return null;
      }

      console.log(`🌊 Fetching RWS data from ${station.name} (${station.locationId})`);

      // Fetch current speed and forecast
      const speedUrl = `${this.baseUrl}${station.locationId}.json`;
      const forecastUrl = `${this.baseUrl}${station.locationId}_FORECAST.json`;
      
      const [speedResponse, forecastResponse] = await Promise.all([
        fetch(speedUrl),
        fetch(forecastUrl).catch(() => null) // Forecast might not be available
      ]);
      
      if (!speedResponse.ok) {
        console.error(`RWS API error: ${speedResponse.status}`);
        return null;
      }

      const speedData = await speedResponse.json();
      const forecastData = forecastResponse ? await forecastResponse.json() : null;
      
      // Parse the response (RWS format can vary)
      let currentSpeed: number | null = null;
      let currentDirection: number | null = null;
      let waterTemperature: number | null = null;
      let timestamp: string | null = null;

      // Extract current data from RWS response
      if (speedData && speedData.length > 0) {
        const latestData = speedData[0];
        currentSpeed = parseFloat(latestData.value) || null;
        timestamp = latestData.dateTime || new Date().toISOString();
      }

      // Extract forecast data if available
      if (forecastData && forecastData.length > 0) {
        console.log(`📈 RWS forecast data available for ${station.name}`);
        // Process forecast data here if needed
      }

      return {
        time: timestamp || new Date().toISOString(),
        currentSpeed,
        currentDirection,
        waterTemperature,
        sourceMeta: {
          provider: 'rws',
          location: station.name
        }
      };

    } catch (error) {
      console.error('RWS API request failed:', error);
      return null;
    }
  }

  /**
   * Enrich Stormglass data with RWS current data (only for today)
   */
  async enrichWithRWSData(stormglassData: any[], lat: number, lng: number, targetDate: string): Promise<any[]> {
    // Only enrich with RWS data for today
    const today = new Date().toISOString().split('T')[0];
    const isToday = targetDate === today;
    
    if (!isToday) {
      console.log(`📅 Skipping RWS enrichment for ${targetDate} (not today)`);
      return stormglassData;
    }

    const rwsData = await this.fetchCurrentData(lat, lng);
    
    if (!rwsData) {
      console.log('🌊 No RWS data available for today');
      return stormglassData;
    }

    console.log(`🔄 Enriching today's data with RWS: current speed = ${rwsData.currentSpeed} kn from ${rwsData.sourceMeta.location}`);

    // Enrich only today's data with RWS current information
    return stormglassData.map(hour => {
      const hourDate = new Date(hour.time).toISOString().split('T')[0];
      const isHourToday = hourDate === today;
      
      return {
        ...hour,
        currentSpeed: isHourToday ? (rwsData.currentSpeed || hour.currentSpeed) : hour.currentSpeed,
        currentDirection: isHourToday ? (rwsData.currentDirection || hour.currentDirection) : hour.currentDirection,
        sourceMeta: {
          ...hour.sourceMeta,
          enrichedWithRWS: isHourToday,
          rwsLocation: isHourToday ? rwsData.sourceMeta.location : undefined
        }
      };
    });
  }
}
