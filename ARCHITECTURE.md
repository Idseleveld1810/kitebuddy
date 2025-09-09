# 🏄‍♂️ Kitebuddy - Architectuur & API Structuur

## 🔄 Recente Wijzigingen (v2025.01.19)

### **Stormglass → Open-Meteo Migratie**
- **Vervangen**: Stormglass API met Open-Meteo API
- **Reden**: Open-Meteo geeft betere wind data (10.6 kn vs 8.4 kn) en is volledig gratis
- **Voordelen**: Geen API key nodig, geen quota limieten, betere data kwaliteit
- **Conversie**: Wind snelheden worden geconverteerd van km/h naar kn (×0.539957)
- **Impact**: Realistischere wind voorspellingen, geen NaN waarden meer in weekoverzicht

## 📋 **Overzicht van Pagina's**

### **1. Hoofdpagina (`/`)**
```
┌─────────────────────────────────────┐
│           Kitebuddy                 │
├─────────────────────────────────────┤
│  🔍 SearchBar (React Component)     │
│  🗺️  SpotMap (React Component)      │
│     └─ Markers voor alle spots      │
│        └─ Click → /{spotId}         │
└─────────────────────────────────────┘
```

### **2. Weekoverzicht (`/{spotId}`)**
```
┌─────────────────────────────────────┐
│    Kitesurf Voorspelling - {spot}   │
├─────────────────────────────────────┤
│  📅 WeeklyOverview (React Component) │
│     ├─ DailyOverviewCard × 7        │
│     │   ├─ Wind Speed & Direction   │
│     │   ├─ Kite Window Display      │
│     │   └─ "Details" Button         │
│     │       └─ Click → /{spotId}/{date} │
│     └─ Data Source: Open-Meteo API  │
└─────────────────────────────────────┘
```

### **3. Detail Pagina (`/{spotId}/{date}`)**
```
┌─────────────────────────────────────┐
│    Kitesurf voorspelling - {date}   │
├─────────────────────────────────────┤
│  📊 WindChart (React Component)     │
│     └─ 06:00-22:00 data filtering   │
│  📋 WeatherTable (React Component)  │
│     ├─ Wind Speed & Gust            │
│     ├─ Wind Direction               │
│     ├─ Weather Icon                 │
│     ├─ Wave Height (1 decimaal)     │
│     ├─ Wave Height (niet beschikbaar)│
│     ├─ Wave Period (niet beschikbaar)│
│     └─ Current Speed (vandaag + RWS)│
│  🔄 "Terug naar overzicht" Button   │
│     └─ Click → /{spotId}            │
└─────────────────────────────────────┘
```

---

## 🔌 **API Endpoints & Data Flow**

### **API 1: `/api/forecast`**
```typescript
GET /api/forecast?spotId={spotId}

📊 Request:
- spotId: string (e.g., "wijk_aan_zee")

📈 Response:
{
  spot: {
    id: string,
    name: string,
    latitude: number,
    longitude: number
  },
  forecast: {
    zondag: HourDetail[],
    maandag: HourDetail[],
    dinsdag: HourDetail[],
    woensdag: HourDetail[],
    donderdag: HourDetail[],
    vrijdag: HourDetail[],
    zaterdag: HourDetail[]
  },
  source: "openmeteo",
  generated: string
}

🔄 Data Flow:
1. Check cache first
2. If cache miss → Open-Meteo API call
3. Convert km/h to knots (×0.539957)
4. Group by day of week
5. Filter 06:00-22:00 hours
6. Cache result for 6 hours
```

### **API 2: `/api/day`**
```typescript
GET /api/day?spotId={spotId}&date={YYYY-MM-DD}

📊 Request:
- spotId: string (e.g., "wijk_aan_zee")
- date: string (e.g., "2025-08-21")

📈 Response:
{
  data: HourDetail[],
  source: "stormglass" | "cache" | "file",
  lastUpdated: string
}

🔄 Data Flow:
1. Check cache first
2. If cache miss → Stormglass API call
3. If Dutch spot → Enrich with RWS data (only today)
4. Filter 06:00-22:00 hours
5. Cache result for 2-6 hours
```

### **API 3: `/api/update` (Admin)**
```typescript
POST /api/update
Content-Type: application/json

📊 Request Body:
{
  "action": "update_popular" | "update_all" | "update_spot" | "clear_cache" | "cache_stats",
  "spotId": "string" (optional)
}

📈 Response:
{
  "success": boolean,
  "message": string,
  "stats": object (for cache_stats)
}
```

---

## 🌊 **Data Providers**

### **1. Stormglass Provider**
```typescript
📡 API: https://api.stormglass.io/v2/weather/point

🔑 Parameters:
- windSpeed20m: Wind speed at 20m height
- gust: Wind gust speed
- windDirection20m: Wind direction at 20m height
- waveHeight: Wave height in meters
- wavePeriod: Wave period in seconds
- waveDirection: Wave direction in degrees
- currentSpeed: Current speed in knots
- currentDirection: Current direction in degrees
- waterTemperature: Water temperature in °C

📊 Response Structure:
{
  hours: [
    {
      time: "2025-08-21T06:00:00+00:00",
      windSpeed20m: { noaa: 8.74 },
      gust: { noaa: 8.82 },
      windDirection20m: { noaa: 3.77 },
      waveHeight: { noaa: 1.21 },
      wavePeriod: { noaa: 5.54 },
      waveDirection: { noaa: 342.15 },
      currentSpeed: { noaa: 0.5 },
      currentDirection: { noaa: 180.0 },
      waterTemperature: { noaa: 19.19 }
    }
  ]
}
```

### **2. RWS Waterinfo Provider (Enrichment)**
```typescript
📡 API: https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGEN/

🔑 Endpoints:
- {stationId}.json (current data)
- {stationId}_FORECAST.json (forecast data)

📊 Stations:
- VLISSGN: Vlissingen
- ROOMPBTN: Roompot Buiten
- HARVT10: Hoek van Holland
- IJMDBTHVN: IJmuiden
- DENHDR: Den Helder

🔄 Enrichment Logic:
- Only for Dutch spots
- Only for today's data
- Override currentSpeed & currentDirection
- Add sourceMeta.enrichedWithRWS: true
```

---

## 💾 **Caching Systeem**

### **Cache Layers**
```typescript
📦 WeatherCache (In-Memory)
├─ Popular Spots: 2 hours TTL
│   ├─ domburg
│   ├─ wijk_aan_zee
│   ├─ scheveningen
│   ├─ katwijk
│   └─ noordwijk
└─ All Other Spots: 6 hours TTL

🔄 Cache Keys:
- Format: "{spotId}_{date}"
- Example: "wijk_aan_zee_2025-08-21"

📊 Cache Stats:
- Hit rate tracking
- Age monitoring
- Manual invalidation
```

### **Batch Updater**
```typescript
⏰ Scheduled Tasks:
├─ Popular Spots: Every 2 hours
└─ All Spots: Every 6 hours

🔄 Background Process:
1. Fetch data for all spots
2. Group by date
3. Cache each day separately
4. Log success/failure rates
```

---

## 🔄 **Data Flow Diagram**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │   Astro     │    │  External   │
│             │    │   Server    │    │    APIs     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Load /         │                   │
       ├──────────────────►│                   │
       │                   │                   │
       │ 2. Click Marker   │                   │
       ├──────────────────►│                   │
       │                   │ 3. /api/forecast  │
       │                   ├──────────────────►│
       │                   │                   │
       │                   │ 4. Open-Meteo API │
       │                   │◄──────────────────┤
       │                   │                   │
       │ 5. Week Overview  │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ 6. Click Details  │                   │
       ├──────────────────►│                   │
       │                   │ 7. /api/day       │
       │                   ├──────────────────►│
       │                   │                   │
       │                   │ 8. Open-Meteo API │
       │                   │◄──────────────────┤
       │                   │                   │
       │                   │ 9. RWS Enrichment │
       │                   │◄──────────────────┤
       │                   │                   │
       │ 10. Detail Page   │                   │
       │◄──────────────────┤                   │
```

---

## 📊 **Data Types**

### **HourDetail Interface**
```typescript
interface HourDetail {
  time: string;                    // ISO timestamp
  windSpeed: number;               // Wind speed in knots
  windGust: number;                // Wind gust in knots
  windDir: number;                 // Wind direction in degrees
  precipitation: number;           // Precipitation in mm
  cloudCover: number;              // Cloud cover percentage
  waveHeight: number;              // Wave height in meters
  wavePeriod?: number;             // Wave period in seconds (niet beschikbaar)
  waveDirection?: number;          // Wave direction in degrees (niet beschikbaar)
  currentSpeed?: number;           // Current speed in knots (RWS alleen)
  currentDirection?: number;       // Current direction in degrees (RWS alleen)
  oceanTemperature?: number;       // Water temperature in °C (niet beschikbaar)
  sourceMeta?: {                   // Data source information
    provider: string;
    enrichedWithRWS?: boolean;
    rwsLocation?: string;
  };
}
```

---

## 🌐 **Data Providers**

### **Primary Provider: Open-Meteo**
```typescript
📊 Open-Meteo API (Gratis)
├─ Base URL: https://api.open-meteo.com/v1
├─ Endpoint: /forecast
├─ Parameters:
│   ├─ wind_speed_10m (km/h → kn conversie)
│   ├─ wind_gusts_10m (km/h → kn conversie)
│   └─ wind_direction_10m (degrees)
├─ Conversie: km/h × 0.539957 = kn
├─ Voordelen:
│   ├─ Geen API key nodig
│   ├─ Geen quota limieten
│   ├─ Betere data kwaliteit
│   └─ Snelle response
└─ Beperkingen:
    ├─ Geen marine data (golven, stroming)
    └─ Alleen wind data beschikbaar
```

### **Secondary Provider: RWS Waterinfo**
```typescript
🌊 RWS Waterinfo API (Gratis)
├─ Doel: Stroming data voor Nederlandse spots
├─ Data: currentSpeed, currentDirection
├─ Timing: Alleen voor vandaag
├─ Locatie: Dichtstbijzijnde RWS station
└─ Enrichment: Voegt toe aan Open-Meteo data
```

### **Fallback Provider: File System**
```typescript
📁 Local JSON Files
├─ Locatie: public/data/forecastData/
├─ Format: {spotId}.json
├─ Structuur: Per dag van de week
├─ Gebruik: Fallback bij API fouten
└─ Data: Oude Open-Meteo data
```

---

## 🎯 **Performance Optimalisaties**

### **1. Caching Strategy**
- **Popular spots**: 2 hours TTL (frequent access)
- **Other spots**: 6 hours TTL (less frequent)
- **Background updates**: Reduce real-time API calls

### **2. Data Filtering**
- **Time range**: Only 06:00-22:00 (kitesurfing hours)
- **Conditional columns**: Show Stormglass data only when available
- **Current data**: Only for today + Dutch spots

### **3. API Quota Management**
- **Unlimited requests** Open-Meteo (gratis)
- **Bundled requests**: Fetch entire week at once
- **Fallback system**: File-based data when API fails

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
MARINE_PROVIDER=openmeteo
# Geen API key nodig voor Open-Meteo
RWS_ENRICH=true
```

### **Astro Configuration**
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',           // Enable API routes
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), tailwind()]
});
```

---

## 📈 **Monitoring & Logging**

### **API Call Tracking**
```typescript
📊 Metrics:
├─ Request count per endpoint
├─ Cache hit/miss rates
├─ API response times
├─ Error rates
└─ Quota usage

📝 Logging:
├─ API calls with parameters
├─ Cache operations
├─ Error details
└─ Performance metrics
```

---

## 🚀 **Deployment Considerations**

### **Production Setup**
```typescript
🌐 Server Requirements:
├─ Node.js 18+
├─ Memory: 512MB+ (for caching)
├─ Storage: Minimal (file fallbacks)
└─ Network: Stable internet (API calls)

🔒 Security:
├─ API keys in environment variables
├─ Rate limiting on API endpoints
├─ Input validation
└─ Error handling
```

---

*Laatst bijgewerkt: 2025-01-19*
