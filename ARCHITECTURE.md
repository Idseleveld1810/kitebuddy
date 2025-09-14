# 🏄‍♂️ Kitebuddy - Architectuur & API Structuur

## 🔄 Recente Wijzigingen (v2025.01.19)

### **Netlify Deployment & SSR Migration**
- **Deployed**: Live op Netlify (stupendous-begonia-2b4413.netlify.app)
- **SSR**: Server-Side Rendering met Netlify Functions
- **API Routes**: `/api/*` endpoints werken via Netlify Functions
- **Environment**: Environment variables via Netlify dashboard
- **Status**: ✅ Weekly overview werkt, ⚠️ Daily overview heeft issues

### **Supabase Authentication Integration**
- **Setup**: Supabase client voor login/signup/logout
- **Environment**: PUBLIC_SUPABASE_URL en PUBLIC_SUPABASE_ANON_KEY
- **Components**: Header.jsx, AuthModal.jsx voor auth UI
- **Status**: ⚠️ Client initialization issues (TypeError: Cannot read properties of undefined)

### **Stormglass → Open-Meteo Migratie**
- **Vervangen**: Stormglass API met Open-Meteo API
- **Reden**: Open-Meteo geeft betere wind data (10.6 kn vs 8.4 kn) en is volledig gratis
- **Voordelen**: Geen API key nodig, geen quota limieten, betere data kwaliteit
- **Conversie**: Wind snelheden worden geconverteerd van km/h naar kn (×0.539957)
- **Impact**: Realistischere wind voorspellingen, geen NaN waarden meer in weekoverzicht

### **Wind Threshold Updates**
- **KITEABLE_THRESHOLD**: 16 kn (was 15 kn)
- **Green Band**: 19+ kn voor highlight
- **Display**: "Geen wind" voor <16 kn, wind windows voor ≥16 kn

## 📋 **Overzicht van Pagina's**

### **1. Hoofdpagina (`/`)**
```
┌─────────────────────────────────────┐
│           Kitebuddy                 │
├─────────────────────────────────────┤
│  🔐 Header (React Component)        │
│     ├─ Login/Signup buttons         │
│     └─ User status display          │
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
│     │   ├─ Weather Icon & Temp      │
│     │   ├─ Kite Window Display      │
│     │   └─ "Details" Button         │
│     │       └─ Click → /{spotId}/{date} │
│     └─ Data Source: Open-Meteo API  │
│     └─ SSR: Server-side fetch       │
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
│     ├─ Weather Icon & Temperature   │
│     ├─ Precipitation & Cloud Cover  │
│     ├─ Wave Height (niet beschikbaar)│
│     ├─ Wave Period (niet beschikbaar)│
│     └─ Current Speed (vandaag + RWS)│
│  🔄 "Terug naar overzicht" Button   │
│     └─ Click → /{spotId}            │
└─────────────────────────────────────┘
```

### **4. Authentication Pages**
```
┌─────────────────────────────────────┐
│  🔐 Auth Modal (React Component)    │
├─────────────────────────────────────┤
│     ├─ Login Form                   │
│     ├─ Signup Form                  │
│     └─ Password Reset               │
│  📧 /auth/callback (Astro Page)     │
│     └─ Email verification handler   │
└─────────────────────────────────────┘
```

### **5. Debug Pages**
```
┌─────────────────────────────────────┐
│  🔍 /debug (Environment Check)      │
├─────────────────────────────────────┤
│     ├─ Server-side env vars         │
│     ├─ Client-side env vars         │
│     └─ Supabase client status       │
│  🔍 /debug-env (Environment Debug)  │
│     └─ Detailed env var inspection  │
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
4. Add temperature, humidity, precipitation, cloud cover, weather codes
5. Group by day of week
6. Filter 06:00-22:00 hours
7. Cache result for 6 hours
8. SSR: Server-side fetch in Astro pages
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
  source: "openmeteo" | "cache" | "file",
  lastUpdated: string
}

🔄 Data Flow:
1. Check cache first
2. If cache miss → Open-Meteo API call
3. If Dutch spot → Enrich with RWS data (only today)
4. Filter 06:00-22:00 hours
5. Cache result for 2-6 hours
```

### **API 3: `/api/health`**
```typescript
GET /api/health

📈 Response:
{
  ok: true
}

🔄 Purpose:
- Health check for Netlify Functions
- Verify SSR is working
- Debug deployment issues
```

### **API 4: `/api/update` (Admin)**
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
  temperature: number;             // Temperature in °C
  humidity: number;                // Humidity percentage
  precipitation: number;           // Precipitation in mm
  cloudCover: number;              // Cloud cover percentage
  weatherCode: number;             // WMO weather code
  waveHeight?: number;             // Wave height in meters (niet beschikbaar)
  wavePeriod?: number;             // Wave period in seconds (niet beschikbaar)
  waveDirection?: number;          // Wave direction in degrees (niet beschikbaar)
  currentSpeed?: number;           // Current speed in knots (RWS alleen)
  currentDirection?: number;       // Current direction in degrees (RWS alleen)
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
# Open-Meteo (geen API key nodig)
MARINE_PROVIDER=openmeteo
RWS_ENRICH=true

# Supabase Authentication
PUBLIC_SUPABASE_URL=https://gminwuoueaymbpjbwieg.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Astro Configuration**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',           // Enable SSR and API routes
  adapter: netlify(),         // Netlify Functions adapter
  integrations: [react(), tailwind()]
});
```

### **Netlify Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
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
🌐 Netlify Deployment:
├─ Node.js 20 (via netlify.toml)
├─ Memory: 1024MB (Netlify Functions)
├─ Storage: Minimal (file fallbacks)
├─ Network: Stable internet (API calls)
└─ URL: stupendous-begonia-2b4413.netlify.app

🔒 Security:
├─ Environment variables in Netlify dashboard
├─ Supabase authentication
├─ Input validation
└─ Error handling

⚠️ Current Issues:
├─ Supabase client initialization (TypeError)
├─ Daily overview cards blank
├─ Environment variables loading
└─ Client-side hydration issues
```

---

---

## 🔧 **Current Status & Known Issues**

### **✅ Working Components**
- **Weekly Overview**: Displays forecast cards with wind data
- **API Endpoints**: `/api/forecast` and `/api/health` working
- **Open-Meteo Integration**: Real weather data loading
- **Netlify Deployment**: Site live and accessible
- **SSR**: Server-side rendering functional

### **⚠️ Known Issues**
- **Supabase Client**: `TypeError: Cannot read properties of undefined (reading 'create')`
- **Daily Overview Cards**: Blank/empty display despite data being available
- **Environment Variables**: Client-side loading issues
- **Authentication**: Login/signup not functional due to Supabase client issues

### **🔍 Debug Tools Available**
- `/debug-env`: Environment variable inspection
- `/debug`: Supabase client status check
- Console logging in components for troubleshooting

### **📋 Next Steps**
1. Fix Supabase client initialization
2. Resolve daily overview card rendering
3. Test authentication functionality
4. Remove debug components once issues resolved

---

*Laatst bijgewerkt: 2025-01-19 - Netlify Deployment & SSR Migration*
