import type { APIRoute } from 'astro';
import { OpenMeteoProvider } from '../../server/providers/openmeteo';
import spots from '../../data/spots_with_wind_top50.json';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const spotId = url.searchParams.get('spotId');
  const date = url.searchParams.get('date');

  if (!spotId || !date) {
    return new Response(JSON.stringify({
      error: 'Missing required parameters: spotId and date'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const spot = spots.find(s => s.spotId === spotId);
  if (!spot) {
    return new Response(JSON.stringify({
      error: `Spot not found: ${spotId}`
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const provider = new OpenMeteoProvider();
    
    const startTime = `${date}T00:00:00.000Z`;
    const endTime = `${date}T23:59:59.999Z`;
    
    const data = await provider.fetchMarineData(
      spot.latitude,
      spot.longitude,
      startTime,
      endTime
    );

    // Filter to kitesurfing hours (06:00-22:00)
    const kitesurfHours = data.filter(entry => {
      const hour = new Date(entry.time).getHours();
      return hour >= 6 && hour <= 22;
    });

    // Calculate statistics
    const windSpeeds = kitesurfHours.map(h => h.windSpeed).filter(s => s > 0);
    const windGusts = kitesurfHours.map(h => h.windGust).filter(g => g > 0);
    const waveHeights = kitesurfHours.map(h => h.waveHeight).filter(w => w !== null);

    const stats = {
      spot: {
        id: spot.spotId,
        name: spot.name,
        latitude: spot.latitude,
        longitude: spot.longitude
      },
      date: date,
      totalHours: kitesurfHours.length,
      windSpeed: {
        min: Math.min(...windSpeeds),
        max: Math.max(...windSpeeds),
        avg: Math.round((windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10) / 10
      },
      windGust: {
        min: Math.min(...windGusts),
        max: Math.max(...windGusts),
        avg: Math.round((windGusts.reduce((a, b) => a + b, 0) / windGusts.length) * 10) / 10
      },
      waveHeight: {
        min: Math.min(...waveHeights),
        max: Math.max(...waveHeights),
        avg: Math.round((waveHeights.reduce((a, b) => a + b, 0) / waveHeights.length) * 100) / 100
      },
      sampleData: kitesurfHours.slice(0, 3).map(h => ({
        time: new Date(h.time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        windSpeed: h.windSpeed,
        windGust: h.windGust,
        windDir: h.windDir,
        waveHeight: h.waveHeight
      }))
    };

    return new Response(JSON.stringify(stats, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch debug data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
