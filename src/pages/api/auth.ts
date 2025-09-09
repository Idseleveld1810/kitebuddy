/**
 * 🔐 Auth API - Authentication endpoints
 * 
 * API endpoints voor login, signup en logout
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 📁 Bestandspaden
const USERS_FILE = path.join(process.cwd(), 'profiles', 'users.json');
const AUTH_FILE = path.join(process.cwd(), 'profiles', 'auth.json');

/**
 * 📖 GET /api/auth/me - Haal huidige gebruiker op
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'No token provided' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad auth data
    if (!fs.existsSync(AUTH_FILE)) {
      return new Response(JSON.stringify({ 
        error: 'No auth data found' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authData = fs.readFileSync(AUTH_FILE, 'utf8');
    const auth = JSON.parse(authData);
    
    const session = auth.sessions[token];
    
    if (!session) {
      return new Response(JSON.stringify({ 
        error: 'Invalid token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      delete auth.sessions[token];
      fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
      
      return new Response(JSON.stringify({ 
        error: 'Session expired' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: session.user
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ GET /api/auth/me error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * 🔑 POST /api/auth/login - Login gebruiker
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Valideer input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad auth data
    if (!fs.existsSync(AUTH_FILE)) {
      return new Response(JSON.stringify({ 
        error: 'No users registered' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authData = fs.readFileSync(AUTH_FILE, 'utf8');
    const auth = JSON.parse(authData);
    
    const user = auth.users[email];
    
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check password (in production: use bcrypt)
    if (user.password !== password) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check email verification
    if (!user.emailVerified) {
      return new Response(JSON.stringify({ 
        error: 'Please verify your email address first' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save session
    auth.sessions[token] = {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      },
      expiresAt: expiresAt.toISOString()
    };

    fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));

    console.log(`✅ Gebruiker ingelogd: ${email}`);

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ POST /api/auth/login error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * 📝 PUT /api/auth/signup - Registreer nieuwe gebruiker
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Valideer input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ 
        error: 'Password must be at least 6 characters' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad of maak auth data
    let auth = { users: {}, sessions: {} };
    if (fs.existsSync(AUTH_FILE)) {
      const authData = fs.readFileSync(AUTH_FILE, 'utf8');
      auth = JSON.parse(authData);
    }

    // Check if user already exists
    if (auth.users[email]) {
      return new Response(JSON.stringify({ 
        error: 'User already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new user
    const userId = 'user_' + Date.now();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    auth.users[email] = {
      id: userId,
      email,
      password, // In production: hash with bcrypt
      emailVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };

    // Zorg ervoor dat profiles directory bestaat
    const profilesDir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }

    // Sla auth data op
    fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));

    // Maak ook een profiel aan in users.json
    let users = {};
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    }

    users[userId] = {
      phone: '',
      preferredSpots: [],
      notifications: true,
      createdAt: new Date().toISOString(),
      lastAlert: null
    };

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    console.log(`✅ Nieuwe gebruiker geregistreerd: ${email}`);

    // TODO: Stuur verificatie e-mail
    console.log(`📧 Verificatie e-mail zou verstuurd worden naar: ${email}`);
    console.log(`🔗 Verificatie link: /api/auth/verify?token=${verificationToken}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      user: {
        id: userId,
        email,
        emailVerified: false
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ PUT /api/auth/signup error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * 🚪 DELETE /api/auth/logout - Logout gebruiker
 */
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'No token provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Laad auth data
    if (!fs.existsSync(AUTH_FILE)) {
      return new Response(JSON.stringify({ 
        error: 'No auth data found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authData = fs.readFileSync(AUTH_FILE, 'utf8');
    const auth = JSON.parse(authData);
    
    // Verwijder session
    if (auth.sessions[token]) {
      delete auth.sessions[token];
      fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
      console.log(`🚪 Gebruiker uitgelogd: ${token}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ DELETE /api/auth/logout error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
