/**
 * 🧪 Test Supabase Setup
 * 
 * Script om te testen of Supabase correct is geconfigureerd
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { 
  supabase, 
  checkSupabaseConfig, 
  testDatabaseConnection,
  getCurrentUser,
  loginUser,
  signupUser,
  logoutUser
} from '../lib/supabaseClient.js';

/**
 * 🧪 Test Runner
 */
async function runTests() {
  console.log('🧪 Supabase Setup Tests gestart...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Configuratie
  console.log('📋 Test 1: Supabase Configuratie');
  const configOk = checkSupabaseConfig();
  if (configOk) {
    console.log('✅ Configuratie OK');
    testsPassed++;
  } else {
    console.log('❌ Configuratie mislukt');
    testsFailed++;
  }

  // Test 2: Database Connectie
  console.log('\n📋 Test 2: Database Connectie');
  try {
    const dbOk = await testDatabaseConnection();
    if (dbOk) {
      console.log('✅ Database connectie OK');
      testsPassed++;
    } else {
      console.log('❌ Database connectie mislukt');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Database test fout:', error.message);
    testsFailed++;
  }

  // Test 3: Huidige Gebruiker
  console.log('\n📋 Test 3: Huidige Gebruiker');
  try {
    const user = await getCurrentUser();
    if (user) {
      console.log('✅ Gebruiker gevonden:', user.email);
      testsPassed++;
    } else {
      console.log('ℹ️ Geen gebruiker ingelogd (normaal)');
      testsPassed++;
    }
  } catch (error) {
    console.log('❌ Gebruiker test fout:', error.message);
    testsFailed++;
  }

  // Test 4: Signup (optioneel)
  console.log('\n📋 Test 4: Signup Test (optioneel)');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test123456';
  
  try {
    console.log(`📝 Test signup voor: ${testEmail}`);
    const signupResult = await signupUser(testEmail, testPassword);
    
    if (signupResult.user) {
      console.log('✅ Signup succesvol');
      testsPassed++;
      
      // Test logout
      await logoutUser();
      console.log('✅ Logout succesvol');
      testsPassed++;
    } else {
      console.log('❌ Signup mislukt');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Signup test fout:', error.message);
    testsFailed++;
  }

  // Test 5: Login (optioneel)
  console.log('\n📋 Test 5: Login Test (optioneel)');
  try {
    console.log(`🔑 Test login voor: ${testEmail}`);
    const loginResult = await loginUser(testEmail, testPassword);
    
    if (loginResult.user) {
      console.log('✅ Login succesvol');
      testsPassed++;
      
      // Test logout
      await logoutUser();
      console.log('✅ Logout succesvol');
      testsPassed++;
    } else {
      console.log('❌ Login mislukt');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Login test fout:', error.message);
    testsFailed++;
  }

  // Resultaten
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTATEN');
  console.log('='.repeat(50));
  console.log(`✅ Geslaagd: ${testsPassed}`);
  console.log(`❌ Gefaald: ${testsFailed}`);
  console.log(`📊 Succes rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 Alle tests geslaagd! Supabase is correct geconfigureerd.');
  } else {
    console.log('\n⚠️ Sommige tests gefaald. Controleer je Supabase configuratie.');
  }

  return { passed: testsPassed, failed: testsFailed };
}

/**
 * 🔧 Environment Check
 */
function checkEnvironment() {
  console.log('🔍 Environment Check:');
  
  const requiredVars = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Niet gevonden`);
      allPresent = false;
    }
  });

  if (!allPresent) {
    console.log('\n⚠️ Maak een .env bestand aan met de vereiste variabelen.');
    console.log('Zie SUPABASE_SETUP.md voor instructies.');
  }

  return allPresent;
}

/**
 * 🚀 Hoofdfunctie
 */
async function main() {
  console.log('🚀 Supabase Setup Test gestart...\n');

  // Check environment
  const envOk = checkEnvironment();
  if (!envOk) {
    console.log('\n❌ Environment niet correct geconfigureerd. Stop.');
    process.exit(1);
  }

  // Run tests
  try {
    await runTests();
  } catch (error) {
    console.error('❌ Test runner fout:', error);
    process.exit(1);
  }
}

// Start tests als script direct wordt uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runTests, checkEnvironment };
