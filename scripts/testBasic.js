/**
 * 🧪 Basic Supabase Test
 * 
 * Eenvoudige test om te controleren of Supabase basis setup werkt
 */

import { checkSupabaseConfig } from '../src/lib/supabaseClient.js';

console.log('🧪 Basic Supabase Test gestart...\n');

// Test 1: Configuratie
console.log('📋 Test 1: Supabase Configuratie');
const configOk = checkSupabaseConfig();

if (configOk) {
  console.log('✅ Configuratie OK');
  console.log('\n🎉 Basis setup werkt!');
  console.log('\n📝 Volgende stappen:');
  console.log('1. Maak een .env bestand aan met je Supabase gegevens');
  console.log('2. Voeg PUBLIC_SUPABASE_URL en PUBLIC_SUPABASE_ANON_KEY toe');
  console.log('3. Herstart je dev server: npm run dev');
  console.log('4. Test de volledige setup: node scripts/testSupabase.js');
} else {
  console.log('❌ Configuratie mislukt');
  console.log('\n📝 Oplossing:');
  console.log('1. Maak een .env bestand aan in de root');
  console.log('2. Voeg je Supabase gegevens toe:');
  console.log('   PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('3. Herstart je dev server');
}
