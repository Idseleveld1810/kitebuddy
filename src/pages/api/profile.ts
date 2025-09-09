/**
 * 👤 Profile API - Gebruikersprofiel beheren
 * 
 * API endpoints voor het ophalen en updaten van gebruikersprofielen
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

// 📁 Bestandspaden
const USERS_FILE = path.join(process.cwd(), 'profiles', 'users.json');

/**
 * 📖 GET /api/profile - Haal gebruikersprofiel op
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'userId parameter is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad gebruikersprofielen
    if (!fs.existsSync(USERS_FILE)) {
      return new Response(JSON.stringify({ 
        error: 'No users found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    
    const userProfile = users[userId];
    
    if (!userProfile) {
      return new Response(JSON.stringify({ 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      profile: userProfile
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ GET /api/profile error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * 💾 PUT /api/profile - Update gebruikersprofiel
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'userId parameter is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { name, phone, preferredSpots, notifications } = body;

    // Valideer input
    if (!name || !phone || !Array.isArray(preferredSpots)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid profile data' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Valideer telefoonnummer
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid phone number format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad bestaande gebruikersprofielen
    let users = {};
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    }

    // Update of maak nieuw profiel
    const updatedProfile = {
      phone,
      preferredSpots,
      notifications: Boolean(notifications),
      updatedAt: new Date().toISOString()
    };

    // Behoud bestaande velden als ze bestaan
    if (users[userId]) {
      updatedProfile.createdAt = users[userId].createdAt;
      updatedProfile.lastAlert = users[userId].lastAlert;
    } else {
      updatedProfile.createdAt = new Date().toISOString();
      updatedProfile.lastAlert = null;
    }

    users[userId] = updatedProfile;

    // Zorg ervoor dat profiles directory bestaat
    const profilesDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }

    // Sla op
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    console.log(`✅ Profiel geüpdatet voor gebruiker: ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ PUT /api/profile error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * 🗑️ DELETE /api/profile - Verwijder gebruikersprofiel
 */
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'userId parameter is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad gebruikersprofielen
    if (!fs.existsSync(USERS_FILE)) {
      return new Response(JSON.stringify({ 
        error: 'No users found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    
    if (!users[userId]) {
      return new Response(JSON.stringify({ 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verwijder gebruiker
    delete users[userId];
    
    // Sla op
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    console.log(`🗑️ Gebruiker verwijderd: ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'User deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ DELETE /api/profile error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
