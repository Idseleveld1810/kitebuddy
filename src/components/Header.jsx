/**
 * 🏠 Header - Simple Navigation
 * 
 * Clean header without authentication for now
 * 
 * @author Kitebuddy Team
 * @version 2.0 (Clean)
 */

import React from 'react';

/**
 * 🏠 Header Component
 */
export default function Header() {
  return (
    <header className="bg-cyan-700 text-white text-center p-3 sm:p-4">
      <div className="flex justify-center items-center mb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold px-4">
          Kitebuddy
        </h1>
      </div>
      
      <p className="text-sm sm:text-base text-cyan-200">
        Kitesurf voorspelling voor Nederland
      </p>
    </header>
  );
}
