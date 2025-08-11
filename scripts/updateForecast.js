// scripts/updateForecast.js
import { fetchForecast } from '../src/data/getForecastData.js';
import fs from 'fs';
import path from 'path';

// Read all spots
const spotsData = JSON.parse(fs.readFileSync('./public/data/spots_with_wind_top50.json', 'utf8'));

// Ensure the forecastData directory exists
const forecastDataDir = './public/data/forecastData';
if (!fs.existsSync(forecastDataDir)) {
  fs.mkdirSync(forecastDataDir, { recursive: true });
}

// Generate forecast data for each spot
for (const spot of spotsData) {
  try {
    console.log(`Generating forecast for ${spot.name}...`);
    const data = await fetchForecast(spot.name);
    
    // Save individual file for this spot
    const filePath = path.join(forecastDataDir, `${spot.spotId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Generated ${spot.spotId}.json`);
  } catch (error) {
    console.error(`❌ Error generating forecast for ${spot.name}:`, error);
  }
}

console.log('✅ All forecast data files have been generated');
