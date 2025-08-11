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
  spotId // ✅ spotId wordt nu ontvangen als prop
}) => {
  const highlightClass =
    avgWind >= 19 ? 'ring-2 ring-green-500 shadow-md' : '';

  const getWindColor = (wind) => {
    if (wind < 13) return 'text-cyan-300';
    if (wind < 16) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div
      className={`flex flex-row items-center justify-between gap-x-4 bg-white border border-cyan-100 rounded-2xl p-4 md:p-6 w-full max-w-md min-h-[100px] ${highlightClass}`}
    >
      {/* 🟦 Datum + Dag + kitewindow */}
      <div className="flex flex-col">
        <div className="text-xs text-gray-400">{shortDate}</div>
        <div className="text-xl font-semibold text-gray-800">{day}</div>
        <div className="text-sm text-gray-600">{kiteWindow}</div>
      </div>

      {/* 🟩 Windsnelheid */}
      <div className={`text-lg font-medium ${getWindColor(avgWind)}`}>
        {avgWind} knopen
      </div>

      {/* 🧭 Windrichting */}
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-500">Wind</div>
        <div className="text-2xl text-cyan-400">
          {directionArrow(windDir)}
        </div>
      </div>

      {/* 🔘 Button */}
      <a
        href={`/${spotId}/${date}`} // ✅ gebruikt nu spotId
        className="px-4 py-1 bg-blue-100 rounded-xl text-sm text-blue-600 hover:bg-blue-200 transition"
      >
        Details
      </a>
    </div>
  );
};

export default DailyOverviewCard;




