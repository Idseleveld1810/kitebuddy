import type { APIRoute } from 'astro';
import { weatherCache } from '../../server/cache';
import { StormglassProvider } from '../../server/providers/stormglass';
import spots from '../../data/spots_with_wind_top50.json';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const spotId = url.searchParams.get('spotId');
  const startDate = url.searchParams.get('startDate');

  console.log('🔍 Weekly API Debug:', { spotId, startDate });

  // Validate parameters
  if (!spotId || !startDate) {
    return new Response(JSON.stringify({
      error: 'Missing required parameters: spotId and startDate'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Find spot
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
    const weeklyData: Record<string, any[]> = {};
    let source = 'cache';
    let lastUpdated: Date | null = null;

    // Generate dates for the week
    const start = new Date(startDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Check cache for each day
    let cacheHits = 0;
    let cacheMisses = 0;

    for (const date of dates) {
      const cachedData = weatherCache.get(spotId, date);
      
      if (cachedData) {
        weeklyData[date] = cachedData;
        cacheHits++;
        
        const dayLastUpdated = weatherCache.getLastUpdated(spotId, date);
        if (dayLastUpdated && (!lastUpdated || dayLastUpdated > lastUpdated)) {
          lastUpdated = dayLastUpdated;
        }
      } else {
        cacheMisses++;
      }
    }

    console.log(`📊 Cache stats for ${spotId}: ${cacheHits} hits, ${cacheMisses} misses`);

    // If we have all data from cache, return it
    if (cacheHits === 7) {
      return new Response(JSON.stringify({
        data: weeklyData,
        source: 'cache',
        lastUpdated: lastUpdated?.toISOString(),
        cacheStats: { hits: cacheHits, misses: cacheMisses }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If we have some cache misses, try to fetch from API
    const apiKey = import.meta.env.STORMGLASS_API_KEY;
    if (!apiKey) {
      console.log('No Stormglass API key configured, falling back to file data');
      source = 'file';
    } else {
      try {
        const provider = new StormglassProvider(apiKey);
        const endDate = new Date(start);
        endDate.setDate(start.getDate() + 7);
        
        const apiData = await provider.fetchMarineData(
          spot.latitude,
          spot.longitude,
          startDate + 'T00:00:00.000Z',
          endDate.toISOString().split('T')[0] + 'T23:59:59.999Z'
        );

        // Group API data by date and cache it
        const groupedByDate: Record<string, any[]> = {};
        apiData.forEach(hour => {
          const date = hour.time.split('T')[0];
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push(hour);
        });

        // Cache each day and add to response
        for (const [date, dayData] of Object.entries(groupedByDate)) {
          weatherCache.set(spotId, date, dayData);
          weeklyData[date] = dayData;
        }

        source = 'stormglass';
        lastUpdated = new Date();
        
        console.log(`✅ Fetched and cached ${Object.keys(groupedByDate).length} days for ${spotId}`);
      } catch (apiError) {
        console.error('API error:', apiError);
        source = 'file';
      }
    }

    // Fallback to file data for missing days
    if (source === 'file') {
      try {
        const forecastPath = path.join(process.cwd(), 'public', 'data', 'forecastData', `${spotId}.json`);
        
        if (fs.existsSync(forecastPath)) {
          const fileContent = fs.readFileSync(forecastPath, 'utf8');
          const forecastData = JSON.parse(fileContent);
          
          const dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];
            
            if (!weeklyData[dateStr] && forecastData[dayName]) {
              weeklyData[dateStr] = forecastData[dayName];
            }
          }
        }
      } catch (fileError) {
        console.error('File data error:', fileError);
      }
    }

    return new Response(JSON.stringify({
      data: weeklyData,
      source,
      lastUpdated: lastUpdated?.toISOString(),
      cacheStats: { hits: cacheHits, misses: cacheMisses }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Weekly API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
