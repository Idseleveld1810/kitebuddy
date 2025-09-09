# 👤 Profiel & SMS Notificaties - Kitebuddy

## 🎯 **Nieuwe Functie: Persoonlijk Profiel + SMS Alerts**

### **📋 Overzicht**
Gebruikers kunnen nu een persoonlijk profiel aanmaken met windvoorkeuren en favoriete spots. Het systeem stuurt automatisch SMS notificaties 48 en 24 uur van tevoren wanneer er wind windows zijn.

## 🚀 **Features**

### **👤 Gebruikersprofiel**
- **Persoonlijke informatie**: Naam, email, telefoonnummer
- **Windvoorkeuren**: Minimum/maximum wind snelheid, voorkeur richtingen
- **Favoriete spots**: Selecteer relevante kitespots met prioriteiten
- **Notificatie instellingen**: 48h en 24h SMS alerts

### **📱 SMS Notificaties**
- **Automatische alerts**: 48 en 24 uur van tevoren
- **Persoonlijke criteria**: Alleen alerts voor jouw voorkeuren
- **Wind window details**: Tijd, snelheid, richting
- **Meerdere providers**: Twilio of email-SMS gateway

### **📊 Statistieken**
- **SMS alerts ontvangen**: Totaal aantal notificaties
- **Wind windows gemist**: Gemiste kansen
- **Favoriete spots**: Aantal geconfigureerde spots

## 🛠️ **Technische Implementatie**

### **🗄️ Database Schema**
```sql
-- Gebruikers
users (id, email, phone, name, created_at)

-- Voorkeuren
user_preferences (user_id, min_wind_speed, max_wind_speed, preferred_directions, ...)

-- Favoriete spots
user_favorite_spots (user_id, spot_id, spot_name, priority)

-- SMS geschiedenis
sms_notifications (user_id, spot_id, forecast_date, notification_type, ...)
```

### **📁 Bestandsstructuur**
```
src/
├── server/
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── connection.ts       # PostgreSQL connectie
│   └── services/
│       └── smsService.ts       # SMS verzending
├── pages/
│   └── profile.astro           # Profiel pagina
└── components/
    └── (toekomstig)
        ├── ProfileForm.jsx     # Profiel formulier
        └── NotificationSettings.jsx # Notificatie instellingen
```

## 🎨 **UI/UX**

### **📱 Profiel Pagina**
- **Gebruikersinformatie**: Naam, email, telefoon
- **Windvoorkeuren**: Snelheid ranges, richting checkboxes
- **Favoriete spots**: Lijst met prioriteiten
- **Notificatie instellingen**: 48h/24h toggles
- **Statistieken**: Overzicht van gebruik

### **🔧 Navigatie**
- **Hoofdpagina**: "👤 Profiel" link in header
- **Profiel pagina**: Volledige configuratie interface
- **Responsive design**: Werkt op alle apparaten

## 📱 **SMS Service**

### **🔌 Providers**
1. **Twilio** (aanbevolen)
   - Professionele SMS service
   - Betrouwbare delivery
   - API integratie

2. **Email-SMS Gateway** (fallback)
   - Gratis alternatief
   - Email naar SMS conversie
   - Voor testing/development

### **📝 Bericht Formaat**
```
🏄‍♂️ Kitebuddy Alert!

Wijk aan Zee - 2025-01-21
Wind: 18 kn uit ZW
Window: 14:00-17:00
over 2 dagen vanaf nu!

Kitebuddy.nl
```

## 🔧 **Setup & Configuratie**

### **📦 Dependencies**
```bash
npm install pg @types/pg
```

### **🌍 Environment Variables**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kitebuddy
DB_USER=postgres
DB_PASSWORD=password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# SMS (Email fallback)
EMAIL_SMS_DOMAIN=sms.example.com
```

### **🗄️ Database Setup**
```bash
# PostgreSQL installeren
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Database aanmaken
createdb kitebuddy

# Schema uitvoeren
psql -d kitebuddy -f src/server/database/schema.sql
```

## 🔄 **Workflow**

### **1. Gebruiker Registreren**
```
Gebruiker → Profiel pagina → Gegevens invullen → Opslaan
```

### **2. Voorkeuren Configureren**
```
Wind snelheid: 12-35 kn
Voorkeur richtingen: W, SW, S
Favoriete spots: Wijk aan Zee, Katwijk
Notificaties: 48h + 24h
```

### **3. Automatische Notificaties**
```
Dagelijkse check → Wind windows detecteren → 
Criteria matchen → SMS verzenden → Geschiedenis opslaan
```

## 📊 **Monitoring & Analytics**

### **📈 Statistieken**
- **SMS delivery rates**: Succesvolle verzendingen
- **User engagement**: Actieve profielen
- **Wind window hits**: Gematchte criteria
- **Spot populariteit**: Meest favoriete spots

### **🔍 Logging**
- **SMS verzending**: Success/failure logs
- **Database queries**: Performance monitoring
- **User actions**: Profiel updates, spot toevoegingen

## 🚀 **Volgende Stappen**

### **📋 Phase 1 (Huidig)**
- ✅ Database schema
- ✅ SMS service
- ✅ Profiel pagina UI
- ✅ Basis navigatie

### **🔧 Phase 2 (Toekomst)**
- [ ] Echte database integratie
- [ ] Profiel formulier functionaliteit
- [ ] SMS notificatie scheduler
- [ ] User authentication

### **📱 Phase 3 (Uitbreiding)**
- [ ] Email notificaties
- [ ] Push notifications
- [ ] Mobile app
- [ ] Social features

## 🐛 **Troubleshooting**

### **❌ Database Connectie**
```bash
# Test connectie
psql -h localhost -U postgres -d kitebuddy

# Check logs
tail -f /var/log/postgresql/postgresql-*.log
```

### **📱 SMS Verzending**
```bash
# Test SMS service
node -e "const { smsService } = require('./src/server/services/smsService'); smsService.sendWindWindowNotification('+31612345678', 'Test', '2025-01-21', 15, 240, '14:00', '17:00', 48);"
```

### **🔧 Environment Variables**
```bash
# Check configuratie
echo $DB_HOST $TWILIO_ACCOUNT_SID
```

---

**Status**: 🟡 In ontwikkeling  
**Laatst bijgewerkt**: 2025-01-19  
**Versie**: v1.3.0-beta
