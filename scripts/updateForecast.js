// scripts/updateForecast.js
import { fetchForecast } from '../src/data/getForecastData.js';
import fs from 'fs';

const data = await fetchForecast('Domburg');
fs.writeFileSync('./src/data/forecastData.json', JSON.stringify(data, null, 2));


console.log('✅ forecastData.json is bijgewerkt');
