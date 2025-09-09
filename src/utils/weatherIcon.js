/**
 * 🌤️ Weather Icon Utility
 * 
 * Functies om weerdata om te zetten naar weerbeeld en iconen
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

/**
 * 🌤️ Bepaal weerbeeld op basis van weather_code (WMO standaard)
 */
export function getWeatherCondition(cloudCover, precipitation, temperature, weatherCode) {
  // Default waarden als data ontbreekt
  cloudCover = cloudCover || 0;
  precipitation = precipitation || 0;
  temperature = temperature || 15;
  weatherCode = weatherCode || 0;

  // Gebruik WMO weather codes als ze beschikbaar zijn (meer accuraat)
  if (weatherCode > 0) {
    return getWeatherFromCode(weatherCode);
  }

  // Fallback naar cloud cover en precipitation logica
  // Regen check (mm per uur)
  if (precipitation > 2.5) {
    return {
      condition: 'regen',
      icon: '🌧️',
      description: 'Regen',
      color: 'text-blue-600'
    };
  } else if (precipitation > 0.5) {
    return {
      condition: 'lichte_regen',
      icon: '🌦️',
      description: 'Lichte regen',
      color: 'text-blue-500'
    };
  }

  // Wolken check
  if (cloudCover > 80) {
    return {
      condition: 'bewolkt',
      icon: '☁️',
      description: 'Bewolkt',
      color: 'text-gray-600'
    };
  } else if (cloudCover > 60) {
    return {
      condition: 'licht_bewolkt',
      icon: '⛅',
      description: 'Licht bewolkt',
      color: 'text-gray-500'
    };
  } else if (cloudCover > 20) {
    return {
      condition: 'deels_bewolkt',
      icon: '🌤️',
      description: 'Deels bewolkt',
      color: 'text-yellow-600'
    };
  } else {
    return {
      condition: 'zonnig',
      icon: '☀️',
      description: 'Zonnig',
      color: 'text-yellow-500'
    };
  }
}

/**
 * 🌤️ Bepaal weerbeeld op basis van WMO weather codes
 */
export function getWeatherFromCode(code) {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  switch (code) {
    // Clear sky
    case 0:
      return { condition: 'helder', icon: '☀️', description: 'Helder', color: 'text-yellow-500' };
    
    // Mainly clear, partly cloudy, and overcast
    case 1: case 2: case 3:
      return { condition: 'deels_bewolkt', icon: '🌤️', description: 'Deels bewolkt', color: 'text-yellow-600' };
    
    // Fog and depositing rime fog
    case 45: case 48:
      return { condition: 'mistig', icon: '🌫️', description: 'Mistig', color: 'text-gray-400' };
    
    // Drizzle: Light, moderate and dense intensity
    case 51: case 53: case 55:
      return { condition: 'motregen', icon: '🌦️', description: 'Motregen', color: 'text-blue-400' };
    
    // Rain: Slight, moderate and heavy intensity
    case 61: case 63: case 65:
      return { condition: 'regen', icon: '🌧️', description: 'Regen', color: 'text-blue-600' };
    
    // Rain: Slight, moderate and heavy intensity
    case 66: case 67:
      return { condition: 'ijzel', icon: '🧊', description: 'Ijzel', color: 'text-blue-300' };
    
    // Snow fall: Slight, moderate and heavy intensity
    case 71: case 73: case 75:
      return { condition: 'sneeuw', icon: '❄️', description: 'Sneeuw', color: 'text-blue-200' };
    
    // Snow grains
    case 77:
      return { condition: 'sneeuw', icon: '❄️', description: 'Sneeuw', color: 'text-blue-200' };
    
    // Rain showers: Slight, moderate and heavy
    case 80: case 81: case 82:
      return { condition: 'regen', icon: '🌧️', description: 'Regen', color: 'text-blue-600' };
    
    // Snow showers: Slight, moderate and heavy
    case 85: case 86:
      return { condition: 'sneeuw', icon: '❄️', description: 'Sneeuw', color: 'text-blue-200' };
    
    // Thunderstorm: Slight, moderate and heavy
    case 95: case 96: case 99:
      return { condition: 'onweer', icon: '⛈️', description: 'Onweer', color: 'text-purple-600' };
    
    // Default fallback
    default:
      return { condition: 'onbekend', icon: '❓', description: 'Onbekend', color: 'text-gray-400' };
  }
}

/**
 * 🌡️ Bepaal temperatuur categorie
 */
export function getTemperatureCategory(temperature) {
  if (temperature < 0) return { category: 'koud', icon: '❄️', color: 'text-blue-400' };
  if (temperature < 10) return { category: 'koel', icon: '🌡️', color: 'text-blue-500' };
  if (temperature < 20) return { category: 'mild', icon: '🌡️', color: 'text-green-500' };
  if (temperature < 25) return { category: 'warm', icon: '🌡️', color: 'text-orange-500' };
  return { category: 'heet', icon: '🌡️', color: 'text-red-500' };
}

/**
 * 🌊 Bepaal wind condities voor kitesurfen
 */
export function getWindCondition(windSpeed, windGust) {
  if (windSpeed < 8) {
    return { condition: 'te_zwak', icon: '😴', description: 'Te zwak', color: 'text-gray-400' };
  } else if (windSpeed < 13) {
    return { condition: 'licht', icon: '🪁', description: 'Licht', color: 'text-blue-400' };
  } else if (windSpeed < 19) {
    return { condition: 'ideaal', icon: '🏄‍♂️', description: 'Ideaal', color: 'text-green-500' };
  } else if (windSpeed < 25) {
    return { condition: 'sterk', icon: '💨', description: 'Sterk', color: 'text-orange-500' };
  } else {
    return { condition: 'te_sterk', icon: '⚠️', description: 'Te sterk', color: 'text-red-500' };
  }
}

/**
 * 🎯 Bepaal algemene weersituatie voor een dag
 */
export function getDailyWeatherSummary(hours) {
  if (!hours || hours.length === 0) {
    return {
      condition: 'onbekend',
      icon: '❓',
      description: 'Geen data',
      color: 'text-gray-400'
    };
  }

  // Debug: log de data structuur
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 getDailyWeatherSummary input:', {
      hoursCount: hours.length,
      sampleHour: hours[0],
      allKeys: hours.length > 0 ? Object.keys(hours[0]) : []
    });
  }

  // Bereken gemiddelde waarden (met fallback voor verschillende data structuren)
  const avgCloudCover = hours.reduce((sum, h) => sum + (h.cloudCover || h.cloud_cover || 0), 0) / hours.length;
  const avgPrecipitation = hours.reduce((sum, h) => sum + (h.rain || h.precipitation || 0), 0) / hours.length;
  const avgTemperature = hours.reduce((sum, h) => sum + (h.temperature || h.temp || 15), 0) / hours.length;

  // Probeer eerst weather_code te gebruiken (meer accuraat)
  const weatherCodes = hours.map(h => h.weatherCode || h.weather_code).filter(code => code !== null && code !== undefined);
  let weather;
  
  if (weatherCodes.length > 0) {
    // Gebruik meest voorkomende weather code
    const mostCommonCode = weatherCodes.sort((a,b) => 
      weatherCodes.filter(v => v === a).length - weatherCodes.filter(v => v === b).length
    ).pop();
    weather = getWeatherFromCode(mostCommonCode);
  } else {
    // Fallback naar cloud cover en precipitation logica
    weather = getWeatherCondition(avgCloudCover, avgPrecipitation, avgTemperature, null);
  }
  
  return {
    ...weather,
    temperature: Math.round(avgTemperature),
    cloudCover: Math.round(avgCloudCover),
    precipitation: Math.round(avgPrecipitation * 10) / 10
  };
}

/**
 * 🌅 Bepaal beste tijd voor kitesurfen op basis van weer
 */
export function getBestKiteTime(hours) {
  if (!hours || hours.length === 0) return null;

  // Filter uren met goede wind (13-25 kn)
  const goodWindHours = hours.filter(h => {
    const speed = h.speed || h.windSpeed || 0;
    return speed >= 13 && speed <= 25;
  });

  if (goodWindHours.length === 0) return null;

  // Zoek uren met minste bewolking en regen
  const bestHours = goodWindHours
    .map(h => ({
      ...h,
      score: (100 - (h.cloudCover || 0)) + (h.rain || 0) * -10
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return bestHours.map(h => ({
    time: h.time,
    windSpeed: h.speed || h.windSpeed,
    windDirection: h.dir || h.windDir,
    cloudCover: h.cloudCover,
    precipitation: h.rain,
    score: h.score
  }));
}
