// getCurrentData.js
// Haalt stromingsdata op van Open-Meteo Marine API en exporteert deze per uur per dag

import fs from 'fs';

const latitude = 51.56; // Domburg
const longitude = 3.50;
const days = 7;

// Opgelet: Open-Meteo marine gebruikt "currents" i.p.v. "current_"
const apiUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=currents_direction,currents_speed&forecast_days=${days}&timezone=Europe%2FAmsterdam`;

async function fetchCurrentData() {
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));


    const hours = json.hourly.time;
    const directions = json.hourly.currents_direction;
    const speeds = json.hourly.currents_speed;

    const output = {};

    for (let i = 0; i < hours.length; i++) {
      const date = hours[i].split('T')[0];
      const time = hours[i].split('T')[1].slice(0, 5); // HH:MM

      if (!output[date]) output[date] = [];

      output[date].push({
        time,
        current_direction: directions[i],
        current_speed: speeds[i],
      });
    }

    fs.writeFileSync('src/data/currentData.json', JSON.stringify(output, null, 2));
    console.log('✅ Stromingsdata opgeslagen in currentData.json');
  } catch (err) {
    console.error('❌ Fout bij ophalen stromingsdata:', err);
  }
}

fetchCurrentData();
