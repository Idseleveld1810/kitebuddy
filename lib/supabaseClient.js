/**
 * 🔐 Supabase Client - Centrale database connectie
 * 
 * Centrale Supabase client voor de hele Kitebuddy applicatie
 * Gebruikt @supabase/supabase-js voor real-time database en authentication
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { createClient } from '@supabase/supabase-js';

// 🔑 Environment variabelen (moeten in .env staan)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// ✅ Valideer environment variabelen
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuratie ontbreekt!');
  console.error('Voeg toe aan .env:');
  console.error('PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  
  // Fallback voor development
  if (import.meta.env.DEV) {
    console.warn('⚠️ Supabase niet geconfigureerd - gebruik mock data');
  }
}

/**
 * 🚀 Supabase Client Instance
 * 
 * Deze client kan gebruikt worden voor:
 * - Database queries (select, insert, update, delete)
 * - Real-time subscriptions
 * - Authentication (login, signup, logout)
 * - File storage
 * - Edge functions
 */
export const supabase = createClient(
  supabaseUrl || 'https://mock.supabase.co',
  supabaseKey || 'mock-key'
);

/**
 * 🔍 Database Helpers
 * 
 * Handige functies voor veelgebruikte database operaties
 */

/**
 * 👤 Haal gebruiker profiel op
 * @param {string} userId - Gebruiker ID
 * @returns {Promise<Object>} Gebruiker profiel
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Fout bij ophalen gebruiker profiel:', error);
    return null;
  }
}

/**
 * 💾 Update gebruiker profiel
 * @param {string} userId - Gebruiker ID
 * @param {Object} updates - Te updaten velden
 * @returns {Promise<Object>} Update resultaat
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Fout bij updaten gebruiker profiel:', error);
    throw error;
  }
}

/**
 * 🏄‍♂️ Haal favoriete spots op
 * @param {string} userId - Gebruiker ID
 * @returns {Promise<Array>} Favoriete spots
 */
export async function getFavoriteSpots(userId) {
  try {
    const { data, error } = await supabase
      .from('user_favorite_spots')
      .select(`
        spot_id,
        spots (
          id,
          name,
          region,
          latitude,
          longitude
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Fout bij ophalen favoriete spots:', error);
    return [];
  }
}

/**
 * ➕ Voeg favoriete spot toe
 * @param {string} userId - Gebruiker ID
 * @param {string} spotId - Spot ID
 * @returns {Promise<Object>} Toegevoegde spot
 */
export async function addFavoriteSpot(userId, spotId) {
  try {
    const { data, error } = await supabase
      .from('user_favorite_spots')
      .insert({
        user_id: userId,
        spot_id: spotId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Fout bij toevoegen favoriete spot:', error);
    throw error;
  }
}

/**
 * 🗑️ Verwijder favoriete spot
 * @param {string} userId - Gebruiker ID
 * @param {string} spotId - Spot ID
 * @returns {Promise<boolean>} Success status
 */
export async function removeFavoriteSpot(userId, spotId) {
  try {
    const { error } = await supabase
      .from('user_favorite_spots')
      .delete()
      .eq('user_id', userId)
      .eq('spot_id', spotId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Fout bij verwijderen favoriete spot:', error);
    return false;
  }
}

/**
 * 🔔 Authentication Helpers
 */

/**
 * 🔑 Login gebruiker
 * @param {string} email - E-mailadres
 * @param {string} password - Wachtwoord
 * @returns {Promise<Object>} Login resultaat
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Login fout:', error);
    throw error;
  }
}

/**
 * 📝 Registreer nieuwe gebruiker
 * @param {string} email - E-mailadres
 * @param {string} password - Wachtwoord
 * @returns {Promise<Object>} Registratie resultaat
 */
export async function signupUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Registratie fout:', error);
    throw error;
  }
}

/**
 * 🚪 Logout gebruiker
 * @returns {Promise<Object>} Logout resultaat
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Logout fout:', error);
    throw error;
  }
}

/**
 * 👤 Haal huidige gebruiker op
 * @returns {Promise<Object|null>} Huidige gebruiker
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('❌ Fout bij ophalen huidige gebruiker:', error);
    return null;
  }
}

/**
 * 🔄 Real-time Helpers
 */

/**
 * 📡 Luister naar profiel updates
 * @param {string} userId - Gebruiker ID
 * @param {Function} callback - Callback functie
 * @returns {Object} Subscription object
 */
export function subscribeToProfileUpdates(userId, callback) {
  return supabase
    .channel('profile_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

/**
 * 📡 Luister naar favoriete spots updates
 * @param {string} userId - Gebruiker ID
 * @param {Function} callback - Callback functie
 * @returns {Object} Subscription object
 */
export function subscribeToFavoriteSpots(userId, callback) {
  return supabase
    .channel('favorite_spots')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_favorite_spots',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

// Exporteer ook de client zelf voor directe toegang
export default supabase;
