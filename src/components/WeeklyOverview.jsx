import React from 'react';
import DailyOverviewCard from './DailyOverviewCard';

const getAvgDirection = (hours) => {
  if (hours.length === 0) return 0;
  const total = hours.reduce((sum, h) => sum + h.dir, 0);
  return Math.round(total / hours.length);
};

const getKiteWindow = (hours) => {
  const window = hours.filter(h => h.speed >= 17 && h.speed <= 35);
  if (window.length === 0) return 'Geen wind';
  const start = window[0].time;
  const end = window[window.length - 1].time;
  return `${start}–${end}`;
};

const getAvgTop4 = (hours) => {
  if (hours.length === 0) return 0;
  const top4 = [...hours].sort((a, b) => b.speed - a.speed).slice(0, 4);
  const total = top4.reduce((sum, h) => sum + h.speed, 0);
  return Math.round(total / top4.length);
};

export default function WeeklyOverview({ forecastData, spotId }) {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {Object.entries(forecastData).map(([day, hours], index) => {
        const kiteWindow = getKiteWindow(hours);
        const avgWind = getAvgTop4(hours);
        const avgDir = getAvgDirection(hours);

        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + index);
        const date = dateObj.toISOString().split("T")[0];
        const shortDate = dateObj.toLocaleDateString("nl-NL", {
          day: 'numeric',
          month: 'short',
        });

        return (
          <DailyOverviewCard
            key={day}
            day={day}
            date={date}
            shortDate={shortDate}
            kiteWindow={kiteWindow}
            avgWind={avgWind}
            windDir={avgDir}
            // 🔹 Nieuwe prop: link naar details
            spotId={spotId}
          />
        );
      })}
    </div>
  );
}

