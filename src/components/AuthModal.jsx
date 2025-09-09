/**
 * 🔐 AuthModal - Login en Signup Modal Component
 * 
 * React component voor inloggen en registreren
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, loginUser, signupUser } from '../lib/supabaseClient.js';

/**
 * 🔐 Authentication Modal Component
 */
export default function AuthModal({ isOpen, onClose, onLogin, onSignup, mode = 'login' }) {
  const [formMode, setFormMode] = useState(mode); // 'login' or 'signup'
  
  // Update formMode when mode prop changes
  useEffect(() => {
    setFormMode(mode);
    // Reset form when mode changes
    setFormData({ email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  }, [mode]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * 🔄 Wissel tussen login en signup
   */
  const switchMode = () => {
    setFormMode(formMode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  /**
   * 📝 Update form data
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  /**
   * ✅ Valideer form data
   */
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Vul alle verplichte velden in');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Voer een geldig e-mailadres in');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten');
      return false;
    }

    if (formMode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return false;
    }

    return true;
  };

  /**
   * 🔑 Handle login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔑 Login poging:', { email: formData.email });
      
      // Check of Supabase beschikbaar is
      if (!supabase) {
        throw new Error('Supabase niet geconfigureerd. Maak een .env bestand aan met je Supabase gegevens.');
      }
      
      // Gebruik echte Supabase login
      const result = await loginUser(formData.email, formData.password);
      
      setSuccess('Succesvol ingelogd!');
      
      // Call parent callback
      if (onLogin) {
        onLogin(result.user);
      }
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📝 Handle signup
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      console.log('📝 Signup poging:', { email: formData.email });
      
      // Check of Supabase beschikbaar is
      if (!supabase) {
        throw new Error('Supabase niet geconfigureerd. Maak een .env bestand aan met je Supabase gegevens.');
      }
      
      // Gebruik echte Supabase signup
      const result = await signupUser(formData.email, formData.password);
      
      if (result.user && !result.user.email_confirmed_at) {
        setSuccess('Account aangemaakt! Controleer je e-mail voor verificatie.');
      } else {
        setSuccess('Account succesvol aangemaakt!');
      }
      
      // Call parent callback
      if (onSignup) {
        onSignup(result.user);
      }
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('❌ Signup error:', error);
      setError(error.message || 'Registreren mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚀 Handle form submit
   */
  const handleSubmit = (e) => {
    if (formMode === 'login') {
      handleLogin(e);
    } else {
      handleSignup(e);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {formMode === 'login' ? '🔑 Inloggen' : '📝 Registreren'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="jouw@email.nl"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Minimaal 6 karakters"
              required
            />
          </div>

          {/* Confirm Password (signup only) */}
          {formMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bevestig wachtwoord *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Herhaal wachtwoord"
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {formMode === 'login' ? 'Inloggen...' : 'Registreren...'}
              </span>
            ) : (
              formMode === 'login' ? 'Inloggen' : 'Registreren'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {formMode === 'login' ? 'Nog geen account?' : 'Al een account?'}
            <button
              onClick={switchMode}
              className="ml-1 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              {formMode === 'login' ? 'Registreren' : 'Inloggen'}
            </button>
          </p>
        </div>

        {/* Info */}
        {formMode === 'signup' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Info:</strong> Na registratie ontvang je een verificatie-e-mail. 
              Klik op de link in de e-mail om je account te activeren.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
