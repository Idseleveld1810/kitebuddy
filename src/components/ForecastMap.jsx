
import React, { useEffect } from "react";
import L from "leaflet";
import Chart from "chart.js/auto";

function getGustColor(gust) {
  if (gust > 45) return 'color:#ef4444;font-weight:600';   // rood
  if (gust > 35) return 'color:#f97316;font-weight:500';   // oranje
  if (gust > 25) return 'color:#10b981;';                  // groen
  return 'color:#3b82f6;';                                 // blauw
}



export default function ForecastMap() {

  useEffect(() => {
    const spots = [
      { name: "Domburg", lat: 51.56, lon: 3.49 },
      { name: "Wijk aan Zee", lat: 52.5, lon: 4.6 },
      { name: "Zandvoort", lat: 52.38, lon: 4.52 },
      { name: "Noordwijk", lat: 52.23, lon: 4.43 },
      { name: "Schellinkhout", lat: 52.65, lon: 5.14 },
      { name: "Muiden", lat: 52.33, lon: 5.07 },
      { name: "Workum", lat: 52.97, lon: 5.43 },
      { name: "Brouwersdam", lat: 51.77, lon: 3.88 }
    ];

    let lat = 51.56;
    let lon = 3.49;

    const map = L.map("map").setView([52.3, 5.2], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lon])
        .addTo(map)
        .bindPopup(spot.name);
      marker.on("click", () => {
        lat = spot.lat;
        lon = spot.lon;
        document.querySelector("h1").innerText = `Kitesurf Voorspelling – ${spot.name}`;
        document.getElementById("forecast").innerHTML = "";
        document.getElementById("now").innerHTML = "";
        fetchForecast();
      });
    });

    function degToArrow(deg) {
      return `<span class="arrow" style="transform: rotate(${deg + 180}deg);">→</span>`;
    }

    async function fetchForecast() {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation&timezone=auto&windspeed_unit=kn`;
      const res = await fetch(url);
      const data = await res.json();
      const times = data.hourly.time;
      const speeds = data.hourly.wind_speed_10m;
      const gusts = data.hourly.wind_gusts_10m;
      const dirs = data.hourly.wind_direction_10m;
      const rain = data.hourly.precipitation;

      const now = data.current_weather;
      document.getElementById("now").innerHTML = `
        <p><strong>Nu:</strong> ${now.windspeed} kn ${degToArrow(now.winddirection)} (${now.winddirection}°)</p>
      `;

      const days = {};
      for (let i = 0; i < times.length; i++) {
        const dt = new Date(times[i]);
        const h = dt.getHours();
        if (h < 6 || h > 22) continue;

        const day = dt.toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "short"
        });
        if (!days[day]) days[day] = [];
        days[day].push({
          hour: h,
          time: dt.toTimeString().slice(0, 5),
          speed: speeds[i],
          gust: gusts[i],
          dir: dirs[i],
          rain: rain[i]
        });
      }

      const container = document.getElementById("forecast");

      for (const [day, values] of Object.entries(days)) {
        const kiteWindow = values.filter((v) => v.speed >= 17 && v.speed <= 35);
        const kiteAvg = kiteWindow.length > 0 ? kiteWindow.reduce((s, v) => s + v.speed, 0) / kiteWindow.length : null;
        const kiteLabels = kiteWindow.map((v) => v.time);
        const kiteTimeRange = kiteLabels.length > 0 ? `${kiteLabels[0]}–${kiteLabels[kiteLabels.length - 1]}` : null;
        const isGood = kiteWindow.length >= 1;
        const avgDir = Math.round(values.reduce((s, v) => s + v.dir, 0) / values.length);
        const detailsId = `details-${day.replace(/\s+/g, "")}`;

        const card = document.createElement("div");
        card.className = "card" + (isGood ? " good" : "");
        card.innerHTML = `
          <h3>${day}</h3>
          <p><strong>Wind:</strong> ${kiteWindow.length > 0 ? kiteAvg.toFixed(1) + ' kn' : '–'}</p>
          <p><strong>Kite window:</strong> ${kiteWindow.length > 0 ? kiteTimeRange + ' (' + kiteWindow.length + 'u)' : '–'}</p>
          <p><strong>Richting:</strong> ${degToArrow(avgDir)} (${avgDir}°)</p>
          <button onclick="document.getElementById('${detailsId}').style.display = (document.getElementById('${detailsId}').style.display === 'none' ? 'block' : 'none')">Toon details</button>
          <div id="${detailsId}" style="display:none">
            <canvas id="chart-${detailsId}" height="150"></canvas>
            <table class="details-table">
              <thead><tr><th>Uur</th><th>Wind</th><th>Gust</th><th>Richting</th><th>Regen</th><th>Stroming</th><th>Stromingsrichting</th></tr></thead>
              <tbody>
                ${values.map(v => `
                  <tr>
                    <td>${v.time}</td>
                    <td>${v.speed.toFixed(1)}</td>
                    ${(() => {
                      const style = getGustColor(v.gust);
                      return `<td><span style='${style}'>${v.gust.toFixed(1)}</span></td>`;
                    })()}
                    <td>${v.dir}&deg;</td>
                    <td>${v.rain} mm</td>
                    <td>X</td>
                    <td>X</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        container.appendChild(card);

        setTimeout(() => {
          const ctx = document.getElementById(`chart-${detailsId}`).getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: {
              labels: values.map(v => v.time),
              datasets: [
                {
                  label: "Wind",
                  data: values.map(v => v.speed),
                  borderWidth: 2,
                  borderColor: "blue",
                  fill: false,
                },
                {
                  label: "Gusts",
                  data: values.map(v => v.gust),
                  borderWidth: 2,
                  borderColor: "orange",
                  fill: false,
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }, 50);
      }
    }

    fetchForecast();
  }, []);

  return (
    <>
      <div id="map" className="h-[300px] m-4 rounded-lg"></div>
      <div id="now" className="text-center text-base"></div>
      <div id="forecast" className="forecast grid gap-4 p-4"></div>
    </>
  );
}
