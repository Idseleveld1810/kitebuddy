# 🏄‍♂️ Kitebuddy - Nederlandse Kitesurf Voorspellingen

Een moderne web-app voor kitesurf windvoorspellingen in Nederland, gebouwd met Astro en React.

## 🚀 Features

### **🌤️ Wind Voorspellingen**
- **Open-Meteo API** - Hoogwaardige wind forecasts
- **RWS Waterinfo** - Stroming data voor Nederlandse kust
- **7-dagen forecast** - Uitgebreide windvoorspellingen
- **Uur-per-uur data** - Gedetailleerde wind informatie

### **🗺️ Spot Management**
- **50+ Nederlandse spots** - Van Wijk aan Zee tot Texel
- **Interactieve kaart** - Leaflet.js met spot markers
- **Zoekfunctionaliteit** - Vind spots snel en eenvoudig

### **📊 Data Visualisatie**
- **Wind charts** - Recharts.js voor wind snelheid en vlagen
- **Wind windows** - Kiteable tijdsvensters berekening
- **Responsive tabellen** - Mobile-first data weergave
- **Real-time updates** - Caching systeem voor performance

### **📱 Mobile-First Design**
- **Responsive layout** - Werkt perfect op alle apparaten
- **Touch-friendly** - Geoptimaliseerd voor mobiel gebruik
- **Fast loading** - Geoptimaliseerde performance

## 🛠️ Technische Stack

- **Framework**: Astro 4.0 + React 19
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js
- **Charts**: Recharts.js
- **APIs**: Open-Meteo, RWS Waterinfo
- **Deployment**: Node.js adapter

## 📦 Installatie

### **Prerequisites**
- Node.js 18+ 
- npm of yarn

### **Setup**
```bash
# Clone repository
git clone https://github.com/your-username/kitebuddy.git
cd kitebuddy

# Install dependencies
npm install

# Start development server
npm run dev
```

De app is nu beschikbaar op `http://localhost:4321`

## 🎯 Gebruik

### **Hoofdpagina (Kaart)**
- Bekijk alle Nederlandse kitespots op de kaart
- Klik op een marker om naar het weekoverzicht te gaan
- Gebruik de zoekbalk om spots te vinden

### **Weekoverzicht per Spot**
- 7-dagen windvoorspelling
- Wind windows per dag
- Gemiddelde wind snelheden
- Klik op een dag voor details

### **Detail Pagina**
- Uur-per-uur wind data
- Interactieve wind charts
- Gedetailleerde tabellen
- Stroming data (vandaag)

## 📁 Project Structuur

```
kitebuddy/
├── src/
│   ├── components/          # React components
│   │   ├── WindChart.jsx    # Wind grafieken
│   │   ├── WeatherTable.jsx # Data tabellen
│   │   ├── WeeklyOverview.jsx # Week overzicht
│   │   └── ...
│   ├── pages/              # Astro pages
│   │   ├── index.astro     # Hoofdpagina (kaart)
│   │   ├── [spotId].astro  # Week overzicht per spot
│   │   └── [spotId]/[date].astro # Detail pagina
│   ├── server/             # Server-side code
│   │   ├── providers/      # API providers
│   │   ├── cache.ts        # Caching systeem
│   │   └── ...
│   └── styles/             # CSS styling
├── public/
│   └── data/               # Statische data bestanden
├── scripts/                # Utility scripts
└── data/                   # Dynamische data
```

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build voor productie
npm run preview      # Preview build

# Data logging (optioneel)
npm run forecast:log # Log forecast data voor analyse
```

## 🌐 API Endpoints

### **Wind Forecasts**
- `GET /api/forecast?spotId={id}` - 7-dagen forecast
- `GET /api/day?spotId={id}&date={date}` - Dag forecast

### **Data Providers**
- **Open-Meteo**: Wind snelheid, vlagen, richting
- **RWS Waterinfo**: Stroming data (Nederlandse kust)

## 📊 Data Formaten

### **Wind Data**
```json
{
  "timestamp": "2025-01-19T15:00",
  "windSpeed": 12.5,
  "windGust": 18.2,
  "windDir": 240,
  "currentSpeed": 0.8,
  "currentDirection": 180
}
```

### **Spot Data**
```json
{
  "spotId": "wijk_aan_zee",
  "name": "Wijk aan Zee",
  "latitude": 52.495,
  "longitude": 4.563,
  "region": "Noord-Holland"
}
```

## 🎨 UI/UX Features

### **Wind Windows**
- Automatische berekening van kiteable tijdsvensters
- Wind snelheid > 12 kn voor kitesurfing
- Duidelijke weergave van beste tijden

### **Responsive Design**
- Mobile-first approach
- Touch-friendly interface
- Optimale leesbaarheid op alle schermen

### **Data Visualisatie**
- Interactieve wind charts
- Kleurgecodeerde wind snelheden
- Intuïtieve navigatie

## 🚀 Deployment

### **Productie Build**
```bash
npm run build
```

### **Node.js Server**
```bash
npm start
```

## 🔄 Recente Updates

### **v1.2.0 - Navigatie Verbetering**
- ✅ Dubbele navigatie knoppen in detail pagina
- ✅ "Week overzicht" en "Terug naar kaart" opties
- ✅ Verbeterde URL handling

### **v1.1.0 - Open-Meteo Integratie**
- ✅ Vervangen Stormglass met Open-Meteo
- ✅ Verbeterde wind data kwaliteit
- ✅ Gratis API zonder limieten

### **v1.0.0 - Basis Functionaliteit**
- ✅ 50+ Nederlandse kitespots
- ✅ 7-dagen windvoorspellingen
- ✅ Interactieve kaart en charts
- ✅ Mobile-first design

## 🤝 Bijdragen

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je wijzigingen (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📝 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Dankbetuiging

- **Open-Meteo** voor gratis wind data
- **Rijkswaterstaat** voor stroming data
- **Astro** team voor het geweldige framework
- **Nederlandse kitesurf community** voor feedback

---

**Gemaakt met ❤️ voor de Nederlandse kitesurf community**

*Laatst bijgewerkt: 2025-01-19*
