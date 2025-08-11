import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
          <Line type="monotone" dataKey="speed" stroke="#3B82F6" name="Wind" />
          <Line
            type="monotone"
            dataKey="gust"
            stroke="#10B981"
            name="Vlagen"
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WindChart;
