import fs from 'fs';
import path from 'path';

// Read spots data from JSON file
let spotsData = [];
try {
  const spotsPath = path.join(process.cwd(), 'public', 'data', 'spots_with_wind_top50.json');
  spotsData = JSON.parse(fs.readFileSync(spotsPath, 'utf8'));
} catch (error) {
  console.error('Could not load spots data:', error);
}

// Create coordinates lookup from spots data
const spotCoordinates = {};
spotsData.forEach(spot => {
  spotCoordinates[spot.name] = { lat: spot.latitude, lon: spot.longitude };
});

const weekdaysNl = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export async function fetchForecast(spot = 'Scheveningen') {
  const coords = spotCoordinates[spot];
  if (!coords) {
    console.error(`❌ No coordinates found for spot: ${spot}`);
    return {};
  }
  
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + 6);

  const start = now.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  // Use the original API call without wave height for now
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation&windspeed_unit=kn&start_date=${start}&end_date=${end}&timezone=auto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.hourly || !data.hourly.time) {
      throw new Error("Ontbrekende 'hourly' data van Open-Meteo");
    }

    const output = {};
    const hours = data.hourly.time;

    for (let i = 0; i < hours.length; i++) {
      const time = new Date(hours[i]);
      const hour = time.getHours();
      if (hour < 6 || hour > 22) continue;

      const dayName = weekdaysNl[time.getDay()];
      const entry = {
        time: time.toTimeString().slice(0, 5),
        speed: data.hourly.wind_speed_10m[i],
        gust: data.hourly.wind_gusts_10m[i],
        dir: Math.round(data.hourly.wind_direction_10m[i]),
        rain: data.hourly.precipitation[i],
        waveHeight: null, // Placeholder for wave height data
      };

      if (!output[dayName]) output[dayName] = [];
      output[dayName].push(entry);
    }

    return output;
  } catch (error) {
    console.error("❌ Kan forecast niet ophalen:", error);
    return {};
  }
}
