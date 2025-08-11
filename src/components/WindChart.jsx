import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const WindChart = ({ data }) => {
  if (!data || data.length === 0) return <p>Geen data beschikbaar</p>;

  return (
    <div className="h-64 w-full bg-white p-4 rounded-lg shadow-sm border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="speed" stroke="#3B82F6" name="Wind (kn)" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="gust"
            stroke="#10B981"
            name="Vlagen (kn)"
            strokeDasharray="4 4"
            strokeWidth={2}
          />
          {data[0]?.waveHeight !== undefined && (
            <Line
              type="monotone"
              dataKey="waveHeight"
              stroke="#8B5CF6"
              name="Golven (m)"
              strokeWidth={2}
              strokeDasharray="2 2"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WindChart;
