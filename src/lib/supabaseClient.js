/**
 * 🔥 Supabase Client Setup
 * 
 * Centrale Supabase client voor Kitebuddy
 * Bevat alle authentication en database functies
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { createClient } from '@supabase/supabase-js';

// ✅ Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// ✅ Debug: Log environment variables
console.log('🔍 Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'undefined'
});

// ✅ Create Supabase client (only if configuration is available)
let supabase = null;

// ✅ Lazy initialization function
function getSupabaseClient() {
  if (!supabase && supabaseUrl && supabaseKey) {
    console.log('🔍 Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
  }
  return supabase;
}

// ✅ Export the lazy client
export { getSupabaseClient as supabase };

// 💡 Gebruik dit bestand overal in je app met:
// import { supabase } from '../lib/supabaseClient';

/**
 * 🔍 Check of Supabase configuratie correct is
 */
export function checkSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuratie ontbreekt');
    console.error('Zorg ervoor dat PUBLIC_SUPABASE_URL en PUBLIC_SUPABASE_ANON_KEY in .env staan');
    return false;
  }
  
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Ongeldige Supabase URL');
    return false;
  }
  
  if (!supabaseKey.startsWith('eyJ')) {
    console.error('❌ Ongeldige Supabase anon key');
    return false;
  }
  
  console.log('✅ Supabase configuratie OK');
  return true;
}

/**
 * 🗄️ Test database connectie
 */
export async function testDatabaseConnection() {
  if (!supabase) {
    console.error('❌ Supabase client niet beschikbaar');
    return false;
  }
  
  try {
    // Probeer een eenvoudige query uit te voeren
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connectie fout:', error.message);
      return false;
    }
    
    console.log('✅ Database connectie succesvol');
    return true;
  } catch (error) {
    console.error('❌ Database test fout:', error.message);
    return false;
  }
}

/**
 * 👤 Haal huidige gebruiker op
 */
export async function getCurrentUser() {
  if (!supabase) {
    console.error('❌ Supabase client niet beschikbaar');
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Fout bij ophalen gebruiker:', error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('❌ GetCurrentUser fout:', error.message);
    return null;
  }
}

/**
 * 🔑 Login gebruiker
 */
export async function loginUser(email, password) {
  try {
    console.log('🔑 Login poging voor:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Login fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Login succesvol voor:', email);
    return data;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

/**
 * 📝 Registreer nieuwe gebruiker
 */
export async function signupUser(email, password) {
  try {
    console.log('📝 Signup poging voor:', email);
    
    // Check if we're in development mode (localhost)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const signupOptions = {
      email: email,
      password: password
    };
    
    // Only add email redirect for production
    if (!isLocalhost) {
      signupOptions.options = {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      };
    }
    
    const { data, error } = await supabase.auth.signUp(signupOptions);
    
    if (error) {
      console.error('❌ Signup fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Signup succesvol voor:', email);
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    throw error;
  }
}

/**
 * 🚪 Logout gebruiker
 */
export async function logoutUser() {
  try {
    console.log('🚪 Logout poging');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Logout succesvol');
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    throw error;
  }
}

/**
 * 🔄 Reset wachtwoord
 */
export async function resetPassword(email) {
  try {
    console.log('🔄 Password reset voor:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    });
    
    if (error) {
      console.error('❌ Password reset fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Password reset email verzonden naar:', email);
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    throw error;
  }
}

/**
 * 📧 Update gebruiker profiel
 */
export async function updateProfile(userId, updates) {
  try {
    console.log('📧 Update profiel voor gebruiker:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('❌ Profiel update fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Profiel succesvol bijgewerkt');
    return data[0];
  } catch (error) {
    console.error('❌ Profiel update error:', error.message);
    throw error;
  }
}

/**
 * 📊 Haal gebruiker profiel op
 */
export async function getProfile(userId) {
  try {
    console.log('📊 Haal profiel op voor gebruiker:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Profiel ophalen fout:', error.message);
      return null;
    }
    
    console.log('✅ Profiel opgehaald');
    return data;
  } catch (error) {
    console.error('❌ Profiel ophalen error:', error.message);
    return null;
  }
}

/**
 * 🎯 Maak gebruiker profiel aan (na registratie)
 */
export async function createProfile(userId, profileData = {}) {
  try {
    console.log('🎯 Maak profiel aan voor gebruiker:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Profiel aanmaken fout:', error.message);
      throw new Error(error.message);
    }
    
    console.log('✅ Profiel succesvol aangemaakt');
    return data[0];
  } catch (error) {
    console.error('❌ Profiel aanmaken error:', error.message);
    throw error;
  }
}

/**
 * 🔔 Luister naar auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * 🎫 Haal huidige sessie op
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Sessie ophalen fout:', error.message);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('❌ Sessie ophalen error:', error.message);
    return null;
  }
}

// ✅ Alle functies zijn al geëxporteerd met individuele export statements hierboven
// 💡 Gebruik dit bestand overal in je app met:
// import { supabase, loginUser, signupUser } from '../lib/supabaseClient';
