# Stormglass Marine Weather Integration

This document explains how to set up and use the Stormglass marine weather provider for enhanced kitesurfing forecasts.

## 🚀 Quick Setup

### 1. Get Stormglass API Key

1. Visit [stormglass.io](https://stormglass.io)
2. Create a free account
3. Navigate to your dashboard
4. Copy your API key

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# Marine weather provider
MARINE_PROVIDER=stormglass

# Your Stormglass API key
STORMGLASS_API_KEY=your_api_key_here

# Optional: Enable RWS enrichment for Dutch spots
RWS_ENRICH=true
```

### 3. Test the Integration

Run the test script to verify everything works:

```bash
# Install tsx if you haven't already
npm install -g tsx

# Set your API key
export STORMGLASS_API_KEY=your_api_key_here

# Run the test
npx tsx src/validation/test-stormglass.ts
```

## 📊 What You Get

### Enhanced Data Fields

The Stormglass integration provides:

- **Wind Data**: Speed, gusts, direction (in knots and degrees)
- **Wave Data**: Height, period, direction (in meters, seconds, degrees)
- **Current Data**: Speed and direction (in knots and degrees)
- **Water Temperature**: Ocean temperature (in Celsius)

### API Endpoints

#### `/api/day?spotId=DOMBURG&date=2025-08-17`

Returns hourly marine data for a specific spot and date:

```json
{
  "spot": {
    "id": "domburg",
    "name": "Domburg",
    "latitude": 51.5633,
    "longitude": 3.4967
  },
  "date": "2025-08-17",
  "data": [
    {
      "time": "06:00",
      "windSpeed": 12.5,
      "windGust": 15.2,
      "windDir": 245,
      "waveHeight": 0.8,
      "wavePeriod": 4.2,
      "waveDirection": 250,
      "currentSpeed": 0.3,
      "currentDirection": 180,
      "oceanTemperature": 18.5,
      "sourceMeta": {
        "provider": "stormglass"
      }
    }
  ],
  "source": "stormglass"
}
```

#### `/api/forecast?spotId=DOMBURG`

Returns weekly forecast grouped by day:

```json
{
  "spot": {
    "id": "domburg",
    "name": "Domburg"
  },
  "forecast": {
    "maandag": [...],
    "dinsdag": [...],
    "woensdag": [...]
  },
  "source": "stormglass",
  "generated": "2025-08-17T10:30:00.000Z"
}
```

## 💰 Pricing & Limits

### Stormglass Tiers

| Plan | Requests/Day | Cost | Features |
|------|-------------|------|----------|
| Free | 50 | €0 | Development only |
| Starter | 1,000 | €19/month | Basic marine data |
| Professional | 5,000 | €49/month | Full marine set + commercial use |
| Enterprise | 50,000 | €129/month | Priority support |

### Recommended Plan

For kitesurfing applications, the **Professional plan (€49/month)** is recommended because:
- 5,000 requests/day covers multiple spots and users
- Commercial use allowed
- Full marine dataset including currents and water temperature

## 🔧 Configuration Options

### Data Sources

Stormglass aggregates data from multiple sources:
- **NOAA**: US National Oceanic and Atmospheric Administration
- **Meteo**: European weather models
- **ICON**: German weather service

The integration uses all sources for maximum accuracy.

### Time Windows

- **Kitesurfing Hours**: 6:00-22:00 (filtered automatically)
- **Forecast Range**: 7 days (configurable)
- **Update Frequency**: Hourly data points

## 🧪 Testing & Validation

### Run Integration Test

```bash
npx tsx src/validation/test-stormglass.ts
```

This will:
- Test API connectivity
- Fetch sample data for Domburg
- Display data quality metrics
- Show kiteable time windows

### Expected Output

```
🧪 Testing Stormglass Integration...

📍 Testing with spot: Domburg (51.5633, 3.4967)
📅 Fetching data for: Sat Aug 17 2024
⏰ Time range: 2024-08-17T00:00:00.000Z to 2024-08-17T23:59:59.999Z

✅ Successfully fetched 24 data points

🏄‍♂️ Kitesurfing hours (6:00-22:00): 17 data points

📊 Sample data points:
  1. 06:00:
     Wind: 8.5 kn (gusts: 12.1 kn, dir: 245°)
     Waves: 0.6m (period: 4.2s)
     Current: 0.3 kn (dir: 180°)
     Water temp: 18.5°C

📈 Data Statistics:
  Wind speeds: 17 points, avg: 12.3 kn
  Wave heights: 17 points, avg: 0.85m
  Water temps: 17 points, avg: 18.7°C

🏄‍♂️ Kiteable conditions (15+ knots): 3 hours
  Kiteable time windows:
    14:00 - 16:00 (max: 18.2 kn)

✅ Stormglass integration test completed successfully!
```

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid Stormglass API key` | Wrong or expired API key | Check your API key in the dashboard |
| `API rate limit exceeded` | Too many requests | Upgrade plan or wait for reset |
| `Marine provider not configured` | Missing env vars | Set `MARINE_PROVIDER=stormglass` |

### Fallback Behavior

If Stormglass is unavailable:
- API returns 503 status
- Clear error message provided
- Existing Open-Meteo data continues to work

## 🔄 Next Steps

### Optional Enhancements

1. **RWS Enrichment**: Add real-time Dutch buoy data
2. **Quality Validation**: Compare forecasts vs observations
3. **Caching**: Reduce API calls with local caching
4. **Multiple Providers**: Add backup weather sources

### Integration with Frontend

The API endpoints are ready to use with your existing frontend. Simply replace the current data fetching with calls to:

- `/api/day?spotId=SPOT_ID&date=YYYY-MM-DD`
- `/api/forecast?spotId=SPOT_ID`

## 📞 Support

- **Stormglass Docs**: [stormglass.io](https://stormglass.io)
- **API Reference**: [documenter.getpostman.com](https://documenter.getpostman.com)
- **Community**: [GitHub Discussions](https://github.com/stormglass-ai/stormglass-api/discussions)

