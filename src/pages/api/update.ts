import type { APIRoute } from 'astro';
import { getBatchUpdater } from '../../server/init-batch-updater';
import { weatherCache } from '../../server/cache';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, spotId } = body;

    console.log('🔄 Manual update request:', { action, spotId });

    const batchUpdater = getBatchUpdater();
    
    if (!batchUpdater) {
      return new Response(JSON.stringify({
        error: 'Batch updater not initialized. Check STORMGLASS_API_KEY configuration.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let result: any = {};

    switch (action) {
      case 'update_popular':
        await batchUpdater.updatePopularSpots();
        result = { message: 'Popular spots update completed' };
        break;
        
      case 'update_all':
        await batchUpdater.updateAllSpots();
        result = { message: 'All spots update completed' };
        break;
        
      case 'update_spot':
        if (!spotId) {
          return new Response(JSON.stringify({
            error: 'spotId required for update_spot action'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        await batchUpdater.manualUpdate(spotId);
        result = { message: `Spot ${spotId} update completed` };
        break;
        
      case 'clear_cache':
        weatherCache.clear();
        result = { message: 'Cache cleared' };
        break;
        
      case 'cache_stats':
        const stats = weatherCache.getStats();
        result = { stats };
        break;
        
      default:
        return new Response(JSON.stringify({
          error: 'Invalid action. Supported actions: update_popular, update_all, update_spot, clear_cache, cache_stats'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Manual update error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
