/**
 * ✅ Email Verification API
 * 
 * Endpoint voor e-mail verificatie na registratie
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

// 📁 Bestandspaden
const AUTH_FILE = path.join(process.cwd(), 'profiles', 'auth.json');

/**
 * ✅ GET /api/auth/verify - Verificeer e-mail adres
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'Verification token is required' 
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
    
    // Zoek gebruiker met dit verificatie token
    let userEmail = null;
    for (const [email, user] of Object.entries(auth.users)) {
      if (user.verificationToken === token) {
        userEmail = email;
        break;
      }
    }
    
    if (!userEmail) {
      return new Response(JSON.stringify({ 
        error: 'Invalid verification token' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificeer e-mail
    auth.users[userEmail].emailVerified = true;
    delete auth.users[userEmail].verificationToken;
    
    fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));

    console.log(`✅ E-mail geverifieerd: ${userEmail}`);

    // Return HTML success page
    const html = `
      <!DOCTYPE html>
      <html lang="nl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>E-mail Geverifieerd - Kitebuddy</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-amber-50 font-sans text-gray-800 min-h-screen flex items-center justify-center">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div class="text-6xl mb-4">✅</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">
              E-mail Geverifieerd!
            </h1>
            <p class="text-gray-600 mb-6">
              Je e-mailadres is succesvol geverifieerd. Je kunt nu inloggen en gebruik maken van alle functies van Kitebuddy.
            </p>
            <a 
              href="/" 
              class="inline-block bg-cyan-600 text-white px-6 py-3 rounded-md hover:bg-cyan-700 transition-colors font-medium"
            >
              Ga naar Kitebuddy
            </a>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('❌ GET /api/auth/verify error:', error);
    
    // Return HTML error page
    const html = `
      <!DOCTYPE html>
      <html lang="nl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificatie Fout - Kitebuddy</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-amber-50 font-sans text-gray-800 min-h-screen flex items-center justify-center">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div class="text-6xl mb-4">❌</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">
              Verificatie Fout
            </h1>
            <p class="text-gray-600 mb-6">
              Er is een fout opgetreden bij het verifiëren van je e-mailadres. Probeer het opnieuw of neem contact op met de support.
            </p>
            <a 
              href="/" 
              class="inline-block bg-cyan-600 text-white px-6 py-3 rounded-md hover:bg-cyan-700 transition-colors font-medium"
            >
              Ga naar Kitebuddy
            </a>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
