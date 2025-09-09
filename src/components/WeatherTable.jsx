import React from 'react';
import WeatherIcon from './WeatherIcon.jsx';

export default function WeatherTable({ data, source, isToday, hasCurrentData }) {
  const filteredData = data.filter(entry => {
    const hour = new Date(entry.time).getHours();
    return hour >= 6 && hour <= 22;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-cyan-100 text-gray-600 sticky top-0 z-10">
          <tr>
            <th className="px-2 sm:px-4 py-2 text-left bg-cyan-100 sticky left-0 z-20">Tijd</th>
            <th className="px-2 sm:px-4 py-2 text-left">Wind (kn)</th>
            <th className="px-2 sm:px-4 py-2 text-left">Vlagen (kn)</th>
            <th className="px-2 sm:px-4 py-2 text-left">Richting</th>
            <th className="px-2 sm:px-4 py-2 text-left">Weer</th>
            {source === 'openmeteo' && isToday && hasCurrentData && (
              <th className="px-2 sm:px-4 py-2 text-left">Stroming (kn)</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredData.map(entry => (
            <tr key={entry.time} className="border-t border-gray-100">
              <td className="px-2 sm:px-4 py-2 bg-white sticky left-0 z-10 font-medium">
                {new Date(entry.time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-2 sm:px-4 py-2">
                <span className={entry.windSpeed >= 19 ? "text-green-500 font-semibold" : entry.windSpeed >= 13 ? "text-blue-500" : "text-cyan-300"}>
                  {entry.windSpeed}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2">
                <span className={entry.windGust >= 45 ? "text-red-500 font-bold" : entry.windGust >= 35 ? "text-orange-500 font-semibold" : entry.windGust >= 25 ? "text-green-500" : "text-blue-400"}>
                  {entry.windGust}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2 flex items-center gap-1 sm:gap-2">
                <span style={{ transform: `rotate(${entry.windDir + 180}deg)` }} className="block text-sm sm:text-base">↑</span>
                <span className="text-xs sm:text-sm">{entry.windDir}&deg;</span>
              </td>
              <td className="px-2 sm:px-4 py-2">
                <WeatherIcon 
                  precipitation={entry.precipitation || 0}
                  cloudCover={entry.cloudCover || 0}
                  temperature={20}
                />
              </td>
              {source === 'openmeteo' && isToday && hasCurrentData && (
                <td className="px-2 sm:px-4 py-2 text-orange-600">
                  {entry.currentSpeed ? entry.currentSpeed.toFixed(1) : '-'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
