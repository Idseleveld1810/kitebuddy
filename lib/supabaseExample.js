/**
 * 📚 Supabase Usage Examples
 * 
 * Voorbeelden van hoe je de Supabase client kunt gebruiken in je Kitebuddy app
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { 
  supabase, 
  loginUser, 
  signupUser, 
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getFavoriteSpots,
  addFavoriteSpot,
  removeFavoriteSpot
} from './supabaseClient.js';

/**
 * 🔑 Authentication Voorbeelden
 */

// Login gebruiker
export async function exampleLogin() {
  try {
    const result = await loginUser('user@example.com', 'password123');
    console.log('✅ Login succesvol:', result.user);
    return result;
  } catch (error) {
    console.error('❌ Login mislukt:', error.message);
  }
}

// Registreer nieuwe gebruiker
export async function exampleSignup() {
  try {
    const result = await signupUser('newuser@example.com', 'password123');
    console.log('✅ Registratie succesvol:', result.user);
    return result;
  } catch (error) {
    console.error('❌ Registratie mislukt:', error.message);
  }
}

// Haal huidige gebruiker op
export async function exampleGetCurrentUser() {
  try {
    const user = await getCurrentUser();
    if (user) {
      console.log('👤 Huidige gebruiker:', user.email);
      return user;
    } else {
      console.log('❌ Geen gebruiker ingelogd');
      return null;
    }
  } catch (error) {
    console.error('❌ Fout bij ophalen gebruiker:', error);
  }
}

/**
 * 👤 Profiel Voorbeelden
 */

// Haal gebruiker profiel op
export async function exampleGetProfile(userId) {
  try {
    const profile = await getUserProfile(userId);
    if (profile) {
      console.log('📋 Gebruiker profiel:', profile);
      return profile;
    } else {
      console.log('❌ Geen profiel gevonden');
      return null;
    }
  } catch (error) {
    console.error('❌ Fout bij ophalen profiel:', error);
  }
}

// Update gebruiker profiel
export async function exampleUpdateProfile(userId) {
  try {
    const updates = {
      phone: '+31612345678',
      notifications: true,
      preferred_spots: ['Wijk aan Zee', 'Katwijk']
    };
    
    const updatedProfile = await updateUserProfile(userId, updates);
    console.log('✅ Profiel geüpdatet:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('❌ Fout bij updaten profiel:', error);
  }
}

/**
 * 🏄‍♂️ Favoriete Spots Voorbeelden
 */

// Haal favoriete spots op
export async function exampleGetFavoriteSpots(userId) {
  try {
    const spots = await getFavoriteSpots(userId);
    console.log('❤️ Favoriete spots:', spots);
    return spots;
  } catch (error) {
    console.error('❌ Fout bij ophalen favoriete spots:', error);
  }
}

// Voeg favoriete spot toe
export async function exampleAddFavoriteSpot(userId, spotId) {
  try {
    const result = await addFavoriteSpot(userId, spotId);
    console.log('✅ Favoriete spot toegevoegd:', result);
    return result;
  } catch (error) {
    console.error('❌ Fout bij toevoegen favoriete spot:', error);
  }
}

// Verwijder favoriete spot
export async function exampleRemoveFavoriteSpot(userId, spotId) {
  try {
    const success = await removeFavoriteSpot(userId, spotId);
    if (success) {
      console.log('✅ Favoriete spot verwijderd');
    } else {
      console.log('❌ Fout bij verwijderen favoriete spot');
    }
    return success;
  } catch (error) {
    console.error('❌ Fout bij verwijderen favoriete spot:', error);
  }
}

/**
 * 🔄 Real-time Voorbeelden
 */

// Luister naar profiel updates
export function exampleSubscribeToProfile(userId) {
  const subscription = supabase
    .channel('profile_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔄 Profiel update:', payload);
        // Update UI hier
      }
    )
    .subscribe();

  return subscription;
}

// Luister naar favoriete spots updates
export function exampleSubscribeToFavoriteSpots(userId) {
  const subscription = supabase
    .channel('favorite_spots')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_favorite_spots',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔄 Favoriete spots update:', payload);
        // Update UI hier
      }
    )
    .subscribe();

  return subscription;
}

/**
 * 🧪 Test Functies
 */

// Test alle functies
export async function runAllExamples() {
  console.log('🧪 Start Supabase voorbeelden...');
  
  // Test huidige gebruiker
  const user = await exampleGetCurrentUser();
  
  if (user) {
    // Test profiel functies
    await exampleGetProfile(user.id);
    await exampleUpdateProfile(user.id);
    
    // Test favoriete spots
    await exampleGetFavoriteSpots(user.id);
    
    // Test real-time subscriptions
    const profileSub = exampleSubscribeToProfile(user.id);
    const spotsSub = exampleSubscribeToFavoriteSpots(user.id);
    
    // Cleanup na 30 seconden
    setTimeout(() => {
      profileSub.unsubscribe();
      spotsSub.unsubscribe();
      console.log('🧹 Subscriptions opgeruimd');
    }, 30000);
  } else {
    console.log('⚠️ Geen gebruiker ingelogd - test login/signup eerst');
  }
}

/**
 * 🔧 Utility Functies
 */

// Check of Supabase is geconfigureerd
export function checkSupabaseConfig() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ Supabase niet geconfigureerd');
    return false;
  }
  
  console.log('✅ Supabase geconfigureerd');
  return true;
}

// Test database connectie
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connectie fout:', error);
      return false;
    }
    
    console.log('✅ Database connectie succesvol');
    return true;
  } catch (error) {
    console.error('❌ Database test fout:', error);
    return false;
  }
}
