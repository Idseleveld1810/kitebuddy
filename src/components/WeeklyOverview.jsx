import React from 'react';
import DailyOverviewCard from './DailyOverviewCard';
import { getBestWindWindows, formatWindWindowDisplay } from '../utils/kiteWindows.js';

const getAvgDirection = (hours) => {
  if (hours.length === 0) return 0;
  const total = hours.reduce((sum, h) => sum + (h.windDir || h.dir || 0), 0);
  return Math.round(total / hours.length);
};

const getAvgTop4 = (hours) => {
  if (hours.length === 0) return 0;
  const top4 = [...hours].sort((a, b) => (b.windSpeed || b.speed || 0) - (a.windSpeed || a.speed || 0)).slice(0, 4);
  const total = top4.reduce((sum, h) => sum + (h.windSpeed || h.speed || 0), 0);
  return Math.round(total / top4.length);
};

export default function WeeklyOverview({ forecastData, spotId, source = 'file' }) {
  // Get today's day of the week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  
  // Map day numbers to Dutch day names
  const numberToDay = {
    0: 'zondag',
    1: 'maandag', 
    2: 'dinsdag',
    3: 'woensdag',
    4: 'donderdag',
    5: 'vrijdag',
    6: 'zaterdag'
  };
  
  // Create array of next 7 days starting from today
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const dayNumber = (currentDayOfWeek + i) % 7;
    const dayName = numberToDay[dayNumber];
    next7Days.push(dayName);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-6">
        {next7Days.map((day, index) => {
          const hours = forecastData[day] || [];
          
          // Get wind window data using the new utility
          const windWindowData = getBestWindWindows(hours);
          const kiteWindowDisplay = formatWindWindowDisplay(windWindowData.allWindows);
          
          // Use the best window's average speed for the main display
          const avgWind = windWindowData.bestSpeed || getAvgTop4(hours);
          const avgDir = getAvgDirection(hours);

          // Calculate the date for this day
          const dateObj = new Date();
          dateObj.setDate(today.getDate() + index);
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
              kiteWindow={kiteWindowDisplay}
              avgWind={avgWind}
              windDir={avgDir}
              spotId={spotId}
              source={source}
              hours={hours} // Voeg hours toe voor weerbeeld
            />
          );
        })}
      </div>
    </div>
  );
}

