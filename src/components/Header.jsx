/**
 * 🏠 Header - Hoofdnavigatie met Authentication
 * 
 * React component voor de header met login/signup knoppen
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal.jsx';
import { supabase, getCurrentUser, logoutUser } from '../lib/supabaseClient.js';

/**
 * 🏠 Header Component
 */
export default function Header() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  /**
   * 🔄 Check voor bestaande login bij component mount
   */
  useEffect(() => {
    // Check of Supabase beschikbaar is
    if (!supabase) {
      console.log('ℹ️ Supabase niet geconfigureerd - skip auth check');
      return;
    }

    // Check Supabase session
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            emailVerified: user.email_confirmed_at ? true : false
          });
        }
      } catch (error) {
        console.error('❌ Fout bij laden user data:', error);
      }
    };

    checkUser();

    // Luister naar auth state changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              emailVerified: session.user.email_confirmed_at ? true : false
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('❌ Fout bij auth state listener:', error);
    }
  }, []);

  /**
   * 🔑 Open login modal
   */
  const openLoginModal = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  /**
   * 📝 Open signup modal
   */
  const openSignupModal = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  /**
   * ❌ Close auth modal
   */
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  /**
   * ✅ Handle successful login
   */
  const handleLogin = (userData) => {
    setUser({
      id: userData.id,
      email: userData.email,
      emailVerified: userData.email_confirmed_at ? true : false
    });
    console.log('✅ Gebruiker ingelogd:', userData);
  };

  /**
   * ✅ Handle successful signup
   */
  const handleSignup = (userData) => {
    setUser({
      id: userData.id,
      email: userData.email,
      emailVerified: userData.email_confirmed_at ? true : false
    });
    console.log('✅ Gebruiker geregistreerd:', userData);
  };

  /**
   * 🚪 Handle logout
   */
  const handleLogout = async () => {
    try {
      if (supabase) {
        await logoutUser();
      }
      setUser(null);
      console.log('🚪 Gebruiker uitgelogd');
    } catch (error) {
      console.error('❌ Logout fout:', error);
    }
  };

  return (
    <>
      <header className="bg-cyan-700 text-white text-center p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1"></div> {/* Linker spacer */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold px-4">
            Kitebuddy
          </h1>
          <div className="flex-1 flex justify-end"> {/* Rechter sectie */}
            {user ? (
              // Logged in user
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-cyan-200">
                    Welkom, {user.email}
                  </div>
                  {!user.emailVerified && (
                    <div className="text-xs text-orange-300">
                      ⚠️ E-mail niet geverifieerd
                    </div>
                  )}
                </div>
                <a 
                  href="/profile" 
                  className="text-sm text-cyan-200 hover:text-white transition-colors px-2 py-1 rounded hover:bg-cyan-600"
                >
                  👤 Profiel
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm text-cyan-200 hover:text-white transition-colors px-2 py-1 rounded hover:bg-cyan-600"
                >
                  🚪 Uitloggen
                </button>
              </div>
            ) : (
              // Not logged in
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLoginModal}
                  className="text-sm text-cyan-200 hover:text-white transition-colors px-3 py-1 rounded border border-cyan-200 hover:border-white hover:bg-cyan-600"
                >
                  🔑 Login
                </button>
                <button
                  onClick={openSignupModal}
                  className="text-sm bg-white text-cyan-700 hover:bg-cyan-50 transition-colors px-3 py-1 rounded font-medium"
                >
                  📝 Sign up
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm sm:text-base text-cyan-200">
          Kitesurf voorspelling voor Nederland
        </p>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onLogin={handleLogin}
        onSignup={handleSignup}
        mode={authMode}
      />
    </>
  );
}
