import type { APIRoute } from 'astro';
import { weatherCache } from '../../server/cache';
import { OpenMeteoProvider } from '../../server/providers/openmeteo';
import { RWSWaterinfoProvider } from '../../server/providers/rwsWaterinfo';
import spots from '../../data/spots_with_wind_top50.json';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const spotId = url.searchParams.get('spotId');
  const date = url.searchParams.get('date');

  console.log('🔍 Daily API Debug:', { spotId, date });

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

  let data: any[] = [];
  let source = 'cache';
  let lastUpdated: Date | null = null;

  try {
    // Check cache first
    const cachedData = weatherCache.get(spotId, date);
    if (cachedData) {
      data = cachedData;
      source = 'cache';
      lastUpdated = weatherCache.getLastUpdated(spotId, date);
      console.log(`✅ Cache hit for ${spotId} on ${date}`);
    } else {
      console.log(`❌ Cache miss for ${spotId} on ${date}, checking API...`);
      
      // If not in cache, try API
      try {
        const provider = new OpenMeteoProvider();
        
        // Calculate start and end times for the day
        const startTime = `${date}T00:00:00.000Z`;
        const endTime = `${date}T23:59:59.999Z`;
        
        // Use original spot coordinates
        const apiData = await provider.fetchMarineData(
          spot.latitude,
          spot.longitude,
          startTime,
          endTime
        );

        // Enrich with RWS current data for Dutch spots (only for today)
        const rwsProvider = new RWSWaterinfoProvider();
        const enrichedData = await rwsProvider.enrichWithRWSData(
          apiData,
          spot.latitude,
          spot.longitude,
          date
        );

        data = enrichedData;
        source = 'openmeteo';
        lastUpdated = new Date();
        
        // Cache the data for future requests
        weatherCache.set(spotId, date, data);
        
        console.log(`✅ Fetched and cached ${data.length} hours for ${spotId} on ${date}`);
      } catch (apiError) {
        console.error('API error:', apiError);
        source = 'file';
      }
    }

    // Fallback to file data if needed
    if (source === 'file' || data.length === 0) {
      try {
        const forecastPath = path.join(process.cwd(), 'public', 'data', 'forecastData', `${spotId}.json`);
        
        if (fs.existsSync(forecastPath)) {
          const fileContent = fs.readFileSync(forecastPath, 'utf8');
          const forecastData = JSON.parse(fileContent);
          
          const dateObj = new Date(date);
          const dayName = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][dateObj.getDay()];
          
          data = forecastData[dayName] || [];
          source = 'file';
          
          console.log(`📁 Loaded file data for ${spotId} on ${dayName}: ${data.length} entries`);
        } else {
          console.error(`Forecast file not found: ${forecastPath}`);
          data = [];
          source = 'none';
        }
      } catch (fileError) {
        console.error('File data error:', fileError);
        data = [];
        source = 'none';
      }
    }

    return new Response(JSON.stringify({
      data,
      source,
      lastUpdated: lastUpdated?.toISOString(),
      cacheInfo: {
        isCached: source === 'cache',
        lastUpdated: lastUpdated?.toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Daily API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch weather data'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
