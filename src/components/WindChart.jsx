import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WindChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 flex items-center justify-center text-gray-500">
        Geen data beschikbaar
      </div>
    );
  }

  const chartData = data
    .filter(entry => {
      const hour = new Date(entry.time).getHours();
      return hour >= 6 && hour <= 22;
    })
    .map(entry => ({
      time: new Date(entry.time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      wind: entry.windSpeed,
      gusts: entry.windGust,
      waveHeight: entry.waveHeight
    }));

  return (
    <div className="w-full h-48 sm:h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize="12"
            tick={{ fontSize: '10px' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize="12"
            tick={{ fontSize: '10px' }}
            domain={[0, 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="wind" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Wind (kn)"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="gusts" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Vlagen (kn)"
            dot={{ r: 3 }}
          />
          {data.some(entry => entry.waveHeight !== null && entry.waveHeight !== undefined && entry.waveHeight > 0.1) && (
            <Line 
              type="monotone" 
              dataKey="waveHeight" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="2 2"
              name="Golven (m)"
              dot={{ r: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WindChart;
