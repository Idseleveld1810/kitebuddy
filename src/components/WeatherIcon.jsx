import React from 'react';

const WeatherIcon = ({ precipitation = 0, cloudCover = null, temperature = null }) => {
  const getWeatherInfo = () => {
    // Snow detection (if temperature ≤ 0°C and precipitation > 0)
    if (temperature !== null && temperature <= 0 && precipitation > 0) {
      return {
        icon: '❄',
        text: `❄ ${precipitation} mm`
      };
    }
    
    // Heavy rain (precipitation > 0.5 mm)
    if (precipitation > 0.5) {
      return {
        icon: '🌧',
        text: `🌧 ${precipitation} mm`
      };
    }
    
    // Light rain (precipitation > 0 but ≤ 0.5 mm)
    if (precipitation > 0 && precipitation <= 0.5) {
      return {
        icon: '🌦',
        text: `🌦 ${precipitation} mm`
      };
    }
    
    // No precipitation, check cloud cover
    if (cloudCover !== null) {
      if (cloudCover >= 70) {
        return {
          icon: '☁',
          text: '☁ Bewolkt'
        };
      } else if (cloudCover >= 30) {
        return {
          icon: '🌤',
          text: '🌤 Gedeeltelijk'
        };
      } else {
        return {
          icon: '☀',
          text: '☀ Zonnig'
        };
      }
    }
    
    // Fallback if no cloud cover data
    if (precipitation === 0) {
      return {
        icon: '☀',
        text: '☀ Zonnig'
      };
    }
    
    // Default fallback
    return {
      icon: '?',
      text: '?'
    };
  };

  const weatherInfo = getWeatherInfo();

  return (
    <span className="flex items-center gap-1">
      {weatherInfo.text}
    </span>
  );
};

export default WeatherIcon;
