/**
 * 🌤️ Test Weather Data Fetching
 * 
 * Script om te testen of weerdata correct wordt opgehaald
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { fetchForecast } from '../src/data/getForecastData.js';
import { getDailyWeatherSummary, getWeatherFromCode } from '../src/utils/weatherIcon.js';

/**
 * 🧪 Test Weather Data
 */
async function testWeatherData() {
  console.log('🌤️ Weather Data Test gestart...\n');

  try {
    // Test 1: Haal forecast data op
    console.log('📋 Test 1: Haal forecast data op voor Scheveningen');
    const forecastData = await fetchForecast('Scheveningen');
    
    if (!forecastData || Object.keys(forecastData).length === 0) {
      console.log('❌ Geen forecast data opgehaald');
      return;
    }
    
    console.log('✅ Forecast data opgehaald');
    console.log('📅 Beschikbare dagen:', Object.keys(forecastData));
    
    // Test 2: Controleer data structuur
    console.log('\n📋 Test 2: Controleer data structuur');
    const firstDay = Object.keys(forecastData)[0];
    const firstDayData = forecastData[firstDay];
    
    if (firstDayData && firstDayData.length > 0) {
      const firstHour = firstDayData[0];
      console.log('✅ Eerste uur data:', {
        time: firstHour.time,
        windSpeed: firstHour.speed,
        windDirection: firstHour.dir,
        temperature: firstHour.temperature,
        cloudCover: firstHour.cloudCover,
        precipitation: firstHour.rain,
        weatherCode: firstHour.weatherCode
      });
    }
    
    // Test 3: Test weerbeeld functies
    console.log('\n📋 Test 3: Test weerbeeld functies');
    
    // Test weather codes
    const testCodes = [0, 1, 45, 61, 71, 95];
    testCodes.forEach(code => {
      const weather = getWeatherFromCode(code);
      console.log(`Code ${code}: ${weather.icon} ${weather.description} (${weather.condition})`);
    });
    
    // Test daily weather summary
    if (firstDayData) {
      const weatherSummary = getDailyWeatherSummary(firstDayData);
      console.log('\n📊 Dagelijkse weer samenvatting:');
      console.log(`Weerbeeld: ${weatherSummary.icon} ${weatherSummary.description}`);
      console.log(`Temperatuur: ${weatherSummary.temperature}°C`);
      console.log(`Bewolking: ${weatherSummary.cloudCover}%`);
      console.log(`Neerslag: ${weatherSummary.precipitation} mm`);
    }
    
    // Test 4: Toon alle dagen
    console.log('\n📋 Test 4: Weerbeeld voor alle dagen');
    Object.entries(forecastData).forEach(([day, hours]) => {
      if (hours && hours.length > 0) {
        const summary = getDailyWeatherSummary(hours);
        const avgWind = hours.reduce((sum, h) => sum + (h.speed || 0), 0) / hours.length;
        console.log(`${day}: ${summary.icon} ${summary.description} | ${Math.round(avgWind)} kn | ${summary.temperature}°C`);
      }
    });
    
    console.log('\n🎉 Weather data test voltooid!');
    
  } catch (error) {
    console.error('❌ Test fout:', error);
  }
}

/**
 * 🚀 Hoofdfunctie
 */
async function main() {
  console.log('🚀 Weather Data Test gestart...\n');
  
  try {
    await testWeatherData();
  } catch (error) {
    console.error('❌ Test runner fout:', error);
    process.exit(1);
  }
}

// Start tests als script direct wordt uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testWeatherData };

