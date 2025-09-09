# 🔥 Supabase Setup Guide

## 📋 Stap 1: Maak een .env bestand aan

Maak een `.env` bestand aan in de root van je project:

```bash
touch .env
```

## 📋 Stap 2: Voeg Supabase configuratie toe

Voeg deze regels toe aan je `.env` bestand:

```env
# 🔥 Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📋 Stap 3: Haal je Supabase gegevens op

1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Ga naar **Settings** > **API**
4. Kopieer de **Project URL** naar `PUBLIC_SUPABASE_URL`
5. Kopieer de **anon public** key naar `PUBLIC_SUPABASE_ANON_KEY`

## 📋 Stap 4: Voeg .env toe aan .gitignore

Zorg ervoor dat je `.env` bestand in `.gitignore` staat:

```bash
echo ".env" >> .gitignore
```

## 📋 Stap 5: Test de setup

Run het test script om te controleren of alles werkt:

```bash
node scripts/testSupabase.js
```

## 📋 Stap 6: Herstart je dev server

```bash
npm run dev
```

## 🎯 Database Schema

Maak deze tabel aan in je Supabase database:

```sql
-- Maak profiles tabel
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Maak policy voor gebruikers om hun eigen profiel te lezen/bewerken
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🔧 Troubleshooting

### ❌ "Failed to resolve import" error
- Controleer of `src/lib/supabaseClient.js` bestaat
- Herstart je dev server: `npm run dev`

### ❌ "Supabase configuratie ontbreekt" error
- Controleer of je `.env` bestand bestaat
- Controleer of de variabelen correct zijn gespeld
- Herstart je dev server

### ❌ "Database connectie mislukt" error
- Controleer of je Supabase project actief is
- Controleer of je API keys correct zijn
- Controleer of je database tabel bestaat

## 🎉 Klaar!

Je Supabase setup is nu compleet! Je kunt nu:

- ✅ Gebruikers registreren en inloggen
- ✅ E-mail verificatie gebruiken
- ✅ Gebruiker profielen beheren
- ✅ Database queries uitvoeren
- ✅ Real-time updates ontvangen

## 📚 Volgende stappen

1. **Profiel pagina**: Maak een profiel pagina waar gebruikers hun gegevens kunnen bewerken
2. **Favoriete spots**: Sla favoriete windsurf spots op per gebruiker
3. **Notificaties**: Stuur e-mail notificaties bij goede wind condities
4. **Social features**: Laat gebruikers spots delen en beoordelen
