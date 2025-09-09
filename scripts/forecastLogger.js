/**
 * 📊 Forecast Logger - Multi-Model Wind Prediction Comparison
 * 
 * Dit script haalt windvoorspellingen op van verschillende modellen:
 * - Stormglass (GFS/ICON modellen)
 * - Windguru (WRF9/HIRLAM modellen)
 * 
 * Doel: Vergelijk voorspellingen om modellen te verbeteren met AI
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import fs from 'fs';
import path from 'path';

// 📍 Configuratie voor Wijk aan Zee
const SPOT_CONFIG = {
  name: "Wijk aan Zee",
  latitude: 52.495,
  longitude: 4.563,
  spotId: "wijk_aan_zee"
};

// 🗓️ Tijdsperiode: vandaag + 6 dagen (7 dagen totaal)
const getDateRange = () => {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  
  const endDate = new Date();
  endDate.setDate(today.getDate() + 6);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  return { startDate, endDate: endDateStr };
};

/**
 * 🌐 Stormglass API Provider
 * Haalt windvoorspellingen op van Stormglass (GFS/ICON modellen)
 */
class StormglassProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.stormglass.io/v2';
  }

  /**
   * Haalt windvoorspellingen op voor een specifieke periode
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} startDate - Start datum (YYYY-MM-DD)
   * @param {string} endDate - Eind datum (YYYY-MM-DD)
   * @returns {Promise<Array>} Array van windvoorspellingen
   */
  async fetchForecast(lat, lng, startDate, endDate) {
    const params = [
      'windSpeed10m',
      'windGust10m', 
      'windDirection10m'
    ].join(',');

    const url = `${this.baseUrl}/weather/point?` + new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      params,
      start: `${startDate}T00:00:00Z`,
      end: `${endDate}T23:59:59Z`,
      source: 'gfs,icon' // Gebruik GFS en ICON modellen
    });

    console.log(`🌐 Stormglass API call: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Stormglass API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseStormglassData(data);
    } catch (error) {
      console.error('❌ Stormglass API error:', error.message);
      return [];
    }
  }

  /**
   * Parsed Stormglass API response naar ons formaat
   * @param {Object} data - Stormglass API response
   * @returns {Array} Array van genormaliseerde voorspellingen
   */
  parseStormglassData(data) {
    const forecasts = [];
    
    if (!data.hours || !Array.isArray(data.hours)) {
      console.log('⚠️ Geen uurdata van Stormglass API');
      return forecasts;
    }

    data.hours.forEach(hour => {
      // Haal wind data op van verschillende modellen
      const models = ['gfs', 'icon'];
      
      models.forEach(model => {
        const windSpeed = hour.windSpeed10m?.[model];
        const windGust = hour.windGust10m?.[model];
        const windDirection = hour.windDirection10m?.[model];

        if (windSpeed !== undefined && windGust !== undefined && windDirection !== undefined) {
          forecasts.push({
            timestamp: hour.time,
            spot: SPOT_CONFIG.name,
            model: `stormglass_${model.toUpperCase()}`,
            speed: Math.round(windSpeed * 0.539957), // Convert m/s to knots
            gust: Math.round(windGust * 0.539957),   // Convert m/s to knots
            dir: Math.round(windDirection)
          });
        }
      });
    });

    console.log(`✅ Stormglass: ${forecasts.length} voorspellingen opgehaald`);
    return forecasts;
  }
}

/**
 * 🌤️ Open-Meteo API Provider (als backup voor Stormglass)
 * Haalt windvoorspellingen op van Open-Meteo (GFS model)
 */
class OpenMeteoProvider {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1';
  }

  /**
   * Haalt windvoorspellingen op voor een specifieke periode
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} startDate - Start datum (YYYY-MM-DD)
   * @param {string} endDate - Eind datum (YYYY-MM-DD)
   * @returns {Promise<Array>} Array van windvoorspellingen
   */
  async fetchForecast(lat, lng, startDate, endDate) {
    const url = `${this.baseUrl}/forecast?` + new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: 'wind_speed_10m,wind_gusts_10m,wind_direction_10m',
      start_date: startDate,
      end_date: endDate
    });

    console.log(`🌐 Open-Meteo API call: ${url}`);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseOpenMeteoData(data);
    } catch (error) {
      console.error('❌ Open-Meteo API error:', error.message);
      return [];
    }
  }

  /**
   * Parsed Open-Meteo API response naar ons formaat
   * @param {Object} data - Open-Meteo API response
   * @returns {Array} Array van genormaliseerde voorspellingen
   */
  parseOpenMeteoData(data) {
    const forecasts = [];
    
    if (!data.hourly || !data.hourly.time) {
      console.log('⚠️ Geen uurdata van Open-Meteo API');
      return forecasts;
    }

    for (let i = 0; i < data.hourly.time.length; i++) {
      const windSpeed = data.hourly.wind_speed_10m[i];
      const windGust = data.hourly.wind_gusts_10m[i];
      const windDirection = data.hourly.wind_direction_10m[i];

      if (windSpeed !== null && windGust !== null && windDirection !== null) {
        forecasts.push({
          timestamp: data.hourly.time[i],
          spot: SPOT_CONFIG.name,
          model: 'openmeteo_GFS',
          speed: Math.round(windSpeed * 0.539957), // Convert km/h to knots
          gust: Math.round(windGust * 0.539957),   // Convert km/h to knots
          dir: Math.round(windDirection)
        });
      }
    }

    console.log(`✅ Open-Meteo: ${forecasts.length} voorspellingen opgehaald`);
    return forecasts;
  }
}

/**
 * 🏄‍♂️ Windguru Provider (Placeholder)
 * 
 * TODO: Implementeer echte Windguru scraping of API
 * Voor nu: Genereer placeholder data voor vergelijking
 */
class WindguruProvider {
  /**
   * Genereert placeholder Windguru voorspellingen
   * @param {string} startDate - Start datum
   * @param {string} endDate - Eind datum
   * @returns {Array} Array van placeholder voorspellingen
   */
  async fetchForecast(startDate, endDate) {
    console.log('🏄‍♂️ Windguru: Placeholder data genereren...');
    
    const forecasts = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Genereer voorspellingen voor elk uur
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Simuleer realistische wind data (iets hoger dan andere modellen)
        const baseSpeed = 12 + Math.sin(hour / 24 * Math.PI) * 8; // 4-20 kn range
        const baseGust = baseSpeed * 1.3; // 30% hoger dan basis snelheid
        
        forecasts.push({
          timestamp: timestamp.toISOString(),
          spot: SPOT_CONFIG.name,
          model: 'windguru_WRF9',
          speed: Math.round(baseSpeed),
          gust: Math.round(baseGust),
          dir: Math.round(200 + Math.sin(hour / 12 * Math.PI) * 60) // 140-260 graden
        });
      }
    }

    console.log(`✅ Windguru: ${forecasts.length} placeholder voorspellingen gegenereerd`);
    return forecasts;
  }
}

/**
 * 💾 Data Logger
 * Slaat alle voorspellingen op in JSON bestand
 */
class ForecastLogger {
  constructor() {
    this.outputPath = path.join(process.cwd(), 'data', 'rawForecasts.json');
  }

  /**
   * Slaat voorspellingen op in JSON bestand
   * @param {Array} forecasts - Array van voorspellingen
   */
  saveForecasts(forecasts) {
    try {
      // Zorg ervoor dat data directory bestaat
      const dataDir = path.dirname(this.outputPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Sla voorspellingen op
      fs.writeFileSync(this.outputPath, JSON.stringify(forecasts, null, 2));
      
      console.log(`💾 Voorspellingen opgeslagen: ${this.outputPath}`);
      console.log(`📊 Totaal: ${forecasts.length} voorspellingen`);
      
      // Toon statistieken per model
      const modelStats = {};
      forecasts.forEach(f => {
        if (!modelStats[f.model]) {
          modelStats[f.model] = { count: 0, avgSpeed: 0, avgGust: 0 };
        }
        modelStats[f.model].count++;
        modelStats[f.model].avgSpeed += f.speed;
        modelStats[f.model].avgGust += f.gust;
      });
      
      Object.keys(modelStats).forEach(model => {
        const stats = modelStats[model];
        stats.avgSpeed = Math.round(stats.avgSpeed / stats.count);
        stats.avgGust = Math.round(stats.avgGust / stats.count);
        console.log(`  ${model}: ${stats.count} voorspellingen, gem. ${stats.avgSpeed} kn (${stats.avgGust} kn vlagen)`);
      });
      
    } catch (error) {
      console.error('❌ Fout bij opslaan voorspellingen:', error.message);
    }
  }
}

/**
 * 🚀 Hoofdfunctie - Start het forecast logging proces
 */
async function main() {
  console.log('🚀 Forecast Logger gestart...');
  console.log(`📍 Spot: ${SPOT_CONFIG.name} (${SPOT_CONFIG.latitude}, ${SPOT_CONFIG.longitude})`);
  
  // Bepaal datum bereik
  const { startDate, endDate } = getDateRange();
  console.log(`📅 Periode: ${startDate} tot ${endDate}`);
  
  // Initialiseer providers
  const stormglassProvider = new StormglassProvider(process.env.STORMGLASS_API_KEY);
  const openMeteoProvider = new OpenMeteoProvider();
  const windguruProvider = new WindguruProvider();
  const logger = new ForecastLogger();
  
  // Haal voorspellingen op van alle modellen
  const allForecasts = [];
  
  // 1. Stormglass voorspellingen
  if (process.env.STORMGLASS_API_KEY) {
    const stormglassForecasts = await stormglassProvider.fetchForecast(
      SPOT_CONFIG.latitude,
      SPOT_CONFIG.longitude,
      startDate,
      endDate
    );
    allForecasts.push(...stormglassForecasts);
  } else {
    console.log('⚠️ Geen STORMGLASS_API_KEY, sla Stormglass over');
  }
  
  // 2. Open-Meteo voorspellingen (als backup)
  const openMeteoForecasts = await openMeteoProvider.fetchForecast(
    SPOT_CONFIG.latitude,
    SPOT_CONFIG.longitude,
    startDate,
    endDate
  );
  allForecasts.push(...openMeteoForecasts);
  
  // 3. Windguru voorspellingen (placeholder)
  const windguruForecasts = await windguruProvider.fetchForecast(startDate, endDate);
  allForecasts.push(...windguruForecasts);
  
  // Sla alle voorspellingen op
  logger.saveForecasts(allForecasts);
  
  console.log('✅ Forecast logging voltooid!');
}

// Start het script als het direct wordt uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, StormglassProvider, OpenMeteoProvider, WindguruProvider };
