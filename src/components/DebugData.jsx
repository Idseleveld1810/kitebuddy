import { useState, useEffect } from 'react';

export default function DebugData({ forecastData, spotId }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading debug info...</div>;
  }

  const dataKeys = Object.keys(forecastData || {});
  const firstDay = dataKeys[0];
  const firstDayData = forecastData?.[firstDay] || [];

  return (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '16px', 
      margin: '16px 0', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontSize: '14px'
    }}>
      <h3>🔍 Debug Info</h3>
      <p><strong>Spot ID:</strong> {spotId}</p>
      <p><strong>Data keys:</strong> {dataKeys.join(', ')}</p>
      <p><strong>First day ({firstDay}):</strong> {firstDayData.length} hours</p>
      {firstDayData.length > 0 && (
        <div>
          <p><strong>Sample hour:</strong></p>
          <pre style={{ background: '#fff', padding: '8px', fontSize: '12px' }}>
            {JSON.stringify(firstDayData[0], null, 2)}
          </pre>
        </div>
      )}
      <p><strong>Raw forecastData:</strong></p>
      <pre style={{ background: '#fff', padding: '8px', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
        {JSON.stringify(forecastData, null, 2)}
      </pre>
    </div>
  );
}
