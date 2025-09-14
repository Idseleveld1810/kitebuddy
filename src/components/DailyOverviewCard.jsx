import React from 'react';

const directionArrow = (degrees) => {
  const rotation = (degrees + 180) % 360;
  return (
    <div
      className="inline-block transform"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      ↑
    </div>
  );
};

const DailyOverviewCard = ({
  day,
  date,
  shortDate,
  kiteWindow,
  avgWind,
  windDir,
  spotId,
  source = 'file',
  hours = [] // Voeg hours toe voor weerbeeld
}) => {
  const highlightClass =
    avgWind >= 19 ? 'ring-2 ring-green-500 shadow-md' : '';

  const getWindColor = (wind) => {
    if (wind < 13) return 'text-cyan-300';
    if (wind < 16) return 'text-blue-500';
    return 'text-green-500';
  };

  // Simple weather summary (no complex logic for now)
  const getWeatherSummary = (hours) => {
    if (!hours || hours.length === 0) {
      return { icon: '❓', temperature: '?', color: 'text-gray-400' };
    }
    
    // Get average temperature
    const avgTemp = Math.round(
      hours.reduce((sum, h) => sum + (h.temperature || 15), 0) / hours.length
    );
    
    // Simple weather icon based on first hour's weather code
    const firstHour = hours[0];
    let icon = '☀️';
    let color = 'text-yellow-500';
    
    if (firstHour.weatherCode) {
      if (firstHour.weatherCode >= 61) icon = '🌧️', color = 'text-blue-600';
      else if (firstHour.weatherCode >= 51) icon = '🌦️', color = 'text-blue-500';
      else if (firstHour.weatherCode >= 3) icon = '☁️', color = 'text-gray-600';
      else if (firstHour.weatherCode >= 1) icon = '🌤️', color = 'text-yellow-600';
    }
    
    return { icon, temperature: avgTemp, color };
  };
  
  const weatherSummary = getWeatherSummary(hours);

  // Handle multiple wind windows display
  const renderWindWindow = () => {
    if (typeof kiteWindow === 'string') {
      return <div className="text-xs sm:text-sm text-gray-600 mt-1 text-center">{kiteWindow}</div>;
    }
    
    // Array of multiple windows
    return (
      <div className="text-xs sm:text-sm text-gray-600 mt-1 text-center">
        {kiteWindow.map((window, index) => (
          <div key={index}>{window}</div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`w-full max-w-md bg-white border border-cyan-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 min-h-[88px] sm:min-h-[100px] ${highlightClass}`}
    >
      <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4">
        {/* Date and Day - Compact width */}
        <div className="w-14 sm:w-16 flex-shrink-0">
          <div className="text-xs text-gray-400">{shortDate}</div>
          <div className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">{day}</div>
        </div>

        {/* Weather Icon - Compact width */}
        <div className="w-10 sm:w-12 flex flex-col items-center flex-shrink-0">
          <div className="text-base sm:text-lg">
            {weatherSummary.icon}
          </div>
          <div className={`text-xs text-center ${weatherSummary.color}`}>
            {weatherSummary.temperature}°C
          </div>
        </div>

        {/* Wind Speed and Kite Window - Compact width */}
        <div className="w-16 sm:w-18 flex flex-col items-center flex-shrink-0">
          <div className={`text-sm sm:text-base font-medium ${getWindColor(avgWind)}`}>
            {avgWind} kn
          </div>
          {renderWindWindow()}
        </div>

        {/* Wind Direction - Compact width */}
        <div className="w-10 sm:w-12 flex flex-col items-center flex-shrink-0">
          <div className="text-xs text-gray-500">Wind</div>
          <div className="text-base sm:text-lg text-cyan-400">
            {directionArrow(windDir)}
          </div>
        </div>

                    {/* Details Button - Fixed width */}
                    <div className="w-16 sm:w-18 flex-shrink-0 flex justify-end">
                      <a
                        href={`/${spotId}/${date}`}
                        className="min-h-[44px] min-w-[44px] px-2 sm:px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs sm:text-sm text-white cursor-pointer flex items-center justify-center transition-colors"
                      >
                        Details
                      </a>
                    </div>
      </div>
    </div>
  );
};

export default DailyOverviewCard;




