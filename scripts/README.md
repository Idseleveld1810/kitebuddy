# 📊 Forecast Logger - Multi-Model Wind Prediction Comparison

## 🎯 Doel

Dit script haalt windvoorspellingen op van verschillende modellen en slaat ze op voor vergelijking en AI-verbetering. Momenteel gefocust op **Wijk aan Zee** als test case.

## 🚀 Gebruik

### **Snelle Start**
```bash
# Met Stormglass API key (als je die hebt)
npm run forecast:log:env

# Zonder Stormglass API key (alleen Open-Meteo + Windguru placeholder)
npm run forecast:log
```

### **Handmatige Uitvoering**
```bash
# Met environment variable
STORMGLASS_API_KEY=your_key_here node scripts/forecastLogger.js

# Zonder API key
node scripts/forecastLogger.js
```

## 📊 Ondersteunde Modellen

### **1. Stormglass API** 🌐
- **Modellen**: GFS, ICON
- **Data**: windSpeed10m, windGust10m, windDirection10m
- **Conversie**: m/s → kn (×0.539957)
- **Status**: ✅ Werkend (met API key)

### **2. Open-Meteo API** 🌤️
- **Modellen**: GFS
- **Data**: wind_speed_10m, wind_gusts_10m, wind_direction_10m
- **Conversie**: km/h → kn (×0.539957)
- **Status**: ✅ Werkend (gratis, geen API key)

### **3. Windguru** 🏄‍♂️
- **Modellen**: WRF9 (placeholder)
- **Data**: Simulated wind data
- **Status**: 🔄 Placeholder (TODO: echte API/scraping)

## 📁 Output Bestand

### **Locatie**: `data/rawForecasts.json`

### **Formaat**:
```json
[
  {
    "timestamp": "2025-08-18T15:00",
    "spot": "Wijk aan Zee",
    "model": "openmeteo_GFS",
    "speed": 9,
    "gust": 13,
    "dir": 240
  },
  {
    "timestamp": "2025-08-18T15:00",
    "spot": "Wijk aan Zee",
    "model": "windguru_WRF9",
    "speed": 17,
    "gust": 22,
    "dir": 255
  }
]
```

### **Velden**:
- `timestamp`: ISO timestamp (YYYY-MM-DDTHH:mm)
- `spot`: Spot naam
- `model`: Model naam (bijv. "openmeteo_GFS", "windguru_WRF9")
- `speed`: Wind snelheid in kn
- `gust`: Wind vlagen in kn
- `dir`: Wind richting in graden

## 📈 Voorbeeld Output

```
🚀 Forecast Logger gestart...
📍 Spot: Wijk aan Zee (52.495, 4.563)
📅 Periode: 2025-08-18 tot 2025-08-24
🌐 Open-Meteo API call: https://api.open-meteo.com/v1/forecast?...
✅ Open-Meteo: 168 voorspellingen opgehaald
🏄‍♂️ Windguru: Placeholder data genereren...
✅ Windguru: 168 placeholder voorspellingen gegenereerd
💾 Voorspellingen opgeslagen: /path/to/data/rawForecasts.json
📊 Totaal: 336 voorspellingen
  openmeteo_GFS: 168 voorspellingen, gem. 9 kn (16 kn vlagen)
  windguru_WRF9: 168 voorspellingen, gem. 17 kn (22 kn vlagen)
✅ Forecast logging voltooid!
```

## 🔧 Configuratie

### **Spot Configuratie**
```javascript
const SPOT_CONFIG = {
  name: "Wijk aan Zee",
  latitude: 52.495,
  longitude: 4.563,
  spotId: "wijk_aan_zee"
};
```

### **Tijdsperiode**
- **Start**: Vandaag
- **Eind**: Vandaag + 6 dagen (7 dagen totaal)
- **Resolutie**: Per uur (24 × 7 = 168 voorspellingen per model)

## 🔄 Volgende Stappen

### **1. Echte Windguru Integratie**
- Implementeer Windguru API of web scraping
- Vervang placeholder data met echte voorspellingen

### **2. Model Comparison Script**
- Maak `modelComparison.js` voor statistische analyse
- Bereken MAE, bias, en andere metrics

### **3. AI Verbetering**
- Gebruik data om modellen te trainen/verbeteren
- Implementeer ensemble voorspellingen

### **4. Uitbreiding naar Meerdere Spots**
- Voeg meer Nederlandse kitespots toe
- Vergelijk modellen per regio

## 🐛 Troubleshooting

### **Stormglass API Error 422**
- **Oorzaak**: Ongeldige parameters
- **Oplossing**: Controleer API key en parameters

### **Open-Meteo API Error**
- **Oorzaak**: Netwerk probleem
- **Oplossing**: Controleer internet verbinding

### **Geen Output Bestand**
- **Oorzaak**: Schrijfrechten probleem
- **Oplossing**: Controleer `data/` directory permissies

## 📝 Code Structuur

```
scripts/
├── forecastLogger.js          # Hoofdscript
├── README.md                  # Deze documentatie
└── (toekomstig)
    ├── modelComparison.js     # Model vergelijking
    ├── windguruScraper.js     # Echte Windguru integratie
    └── aiTrainer.js          # AI model training
```

## 🤝 Bijdragen

1. Fork de repository
2. Maak een feature branch
3. Implementeer je wijzigingen
4. Test met `npm run forecast:log`
5. Submit een pull request

---

*Laatst bijgewerkt: 2025-01-19*
