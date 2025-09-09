import { OpenMeteoProvider } from './providers/openmeteo';
import { weatherCache } from './cache';
import spots from '../data/spots_with_wind_top50.json';


interface BatchUpdateConfig {
  popularSpotsInterval: number; // 2 hours
  allSpotsInterval: number;     // 6 hours
  popularSpots: string[];
}

export class BatchUpdater {
  private provider: OpenMeteoProvider;
  private config: BatchUpdateConfig;
  private isRunning: boolean = false;

  constructor() {
    this.provider = new OpenMeteoProvider();
    this.config = {
      popularSpotsInterval: 2 * 60 * 60 * 1000, // 2 hours
      allSpotsInterval: 6 * 60 * 60 * 1000,     // 6 hours
      popularSpots: ['domburg', 'wijk_aan_zee', 'scheveningen', 'katwijk', 'noordwijk']
    };
  }

  private async updateSpot(spotId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const spot = spots.find(s => s.spotId === spotId);
      if (!spot) {
        console.error(`Spot not found: ${spotId}`);
        return false;
      }

      console.log(`🔄 Updating ${spotId} from ${startDate} to ${endDate}`);
      
      // Use original spot coordinates
      const data = await this.provider.fetchMarineData(
        spot.latitude,
        spot.longitude,
        startDate,
        endDate
      );

      // Group data by date and cache each day
      const groupedByDate = this.groupDataByDate(data);
      
      for (const [date, dayData] of Object.entries(groupedByDate)) {
        weatherCache.set(spotId, date, dayData);
      }

      console.log(`✅ Updated ${spotId}: ${Object.keys(groupedByDate).length} days cached`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${spotId}:`, error);
      return false;
    }
  }

  private groupDataByDate(data: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    data.forEach(hour => {
      const date = hour.time.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(hour);
    });

    return grouped;
  }

  private getDateRange(days: number): { start: string; end: string } {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return {
      start: start.toISOString().split('T')[0] + 'T00:00:00.000Z',
      end: end.toISOString().split('T')[0] + 'T23:59:59.999Z'
    };
  }

  async updatePopularSpots(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Batch update already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting popular spots update...');

    const { start, end } = this.getDateRange(7);
    let successCount = 0;

    for (const spotId of this.config.popularSpots) {
      const success = await this.updateSpot(spotId, start, end);
      if (success) successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Popular spots update complete: ${successCount}/${this.config.popularSpots.length} successful`);
    this.isRunning = false;
  }

  async updateAllSpots(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Batch update already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting all spots update...');

    const { start, end } = this.getDateRange(7);
    let successCount = 0;

    for (const spot of spots) {
      const success = await this.updateSpot(spot.spotId, start, end);
      if (success) successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ All spots update complete: ${successCount}/${spots.length} successful`);
    this.isRunning = false;
  }

  startScheduler(): void {
    console.log('📅 Starting batch update scheduler...');
    
    // Update popular spots every 2 hours
    setInterval(() => {
      this.updatePopularSpots();
    }, this.config.popularSpotsInterval);

    // Update all spots every 6 hours
    setInterval(() => {
      this.updateAllSpots();
    }, this.config.allSpotsInterval);

    // Initial update
    setTimeout(() => {
      this.updatePopularSpots();
    }, 5000); // Start after 5 seconds
  }

  async manualUpdate(spotId?: string): Promise<void> {
    if (spotId) {
      const { start, end } = this.getDateRange(7);
      await this.updateSpot(spotId, start, end);
    } else {
      await this.updateAllSpots();
    }
  }
}
