interface CachedWeatherData {
  data: any;
  timestamp: number;
  expires: number;
}

interface CacheConfig {
  defaultTtl: number; // Time to live in milliseconds
  popularSpotsTtl: number;
  popularSpots: string[];
}

export class WeatherCache {
  private cache: Map<string, CachedWeatherData> = new Map();
  private config: CacheConfig;

  constructor() {
    this.config = {
      defaultTtl: 6 * 60 * 60 * 1000, // 6 hours
      popularSpotsTtl: 2 * 60 * 60 * 1000, // 2 hours
      popularSpots: ['domburg', 'wijk_aan_zee', 'scheveningen', 'katwijk', 'noordwijk']
    };
  }

  private getCacheKey(spotId: string, date: string): string {
    return `${spotId}_${date}`;
  }

  private getTtl(spotId: string): number {
    return this.config.popularSpots.includes(spotId) 
      ? this.config.popularSpotsTtl 
      : this.config.defaultTtl;
  }

  get(spotId: string, date: string): any | null {
    const key = this.getCacheKey(spotId, date);
    const cached = this.cache.get(key);

    if (!cached) {
      console.log(`Cache miss for ${key}`);
      return null;
    }

    if (Date.now() > cached.expires) {
      console.log(`Cache expired for ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit for ${key}, age: ${Math.round((Date.now() - cached.timestamp) / 1000 / 60)} minutes`);
    return cached.data;
  }

  set(spotId: string, date: string, data: any): void {
    const key = this.getCacheKey(spotId, date);
    const ttl = this.getTtl(spotId);
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + ttl
    });

    console.log(`Cached ${key} for ${Math.round(ttl / 1000 / 60)} minutes`);
  }

  getLastUpdated(spotId: string, date: string): Date | null {
    const key = this.getCacheKey(spotId, date);
    const cached = this.cache.get(key);
    return cached ? new Date(cached.timestamp) : null;
  }

  isExpired(spotId: string, date: string): boolean {
    const key = this.getCacheKey(spotId, date);
    const cached = this.cache.get(key);
    return !cached || Date.now() > cached.expires;
  }

  clear(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getStats(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    this.cache.forEach((item) => {
      if (now > item.expires) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      expired,
      valid
    };
  }
}

// Global cache instance
export const weatherCache = new WeatherCache();
