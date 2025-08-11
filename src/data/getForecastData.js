const spotCoordinates = {
  'Scheveningen': { lat: 52.1, lon: 4.27 },
  'IJmuiden': { lat: 52.45, lon: 4.58 },
  'Domburg': { lat: 51.57, lon: 3.50 },
};

const weekdaysNl = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export async function fetchForecast(spot = 'Scheveningen') {
  const coords = spotCoordinates[spot] || spotCoordinates['Scheveningen'];
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + 6);

  const start = now.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

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
