/**
 * 👤 Profile Manager - Gebruikersprofielen beheren
 * 
 * Maakt, bewerkt en slaat gebruikersvoorkeuren op in JSON bestanden
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import fs from 'fs';
import path from 'path';

// 📁 Bestandspaden
const USERS_FILE = path.join(process.cwd(), 'profiles', 'users.json');

/**
 * 👤 Profile Manager Class
 * Beheert gebruikersprofielen en voorkeuren
 */
export class ProfileManager {
  constructor() {
    this.ensureProfilesDirectory();
  }

  /**
   * 📁 Zorg ervoor dat profiles directory bestaat
   */
  ensureProfilesDirectory() {
    const profilesDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
      console.log(`📁 Profiles directory aangemaakt: ${profilesDir}`);
    }
  }

  /**
   * 📖 Laad alle gebruikersprofielen
   * @returns {Object} Gebruikersprofielen
   */
  loadUsers() {
    try {
      if (!fs.existsSync(USERS_FILE)) {
        // Maak leeg bestand aan als het niet bestaat
        this.saveUsers({});
        return {};
      }

      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Fout bij laden gebruikersprofielen:', error.message);
      return {};
    }
  }

  /**
   * 💾 Sla gebruikersprofielen op
   * @param {Object} users - Gebruikersprofielen
   */
  saveUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`✅ Gebruikersprofielen opgeslagen: ${USERS_FILE}`);
    } catch (error) {
      console.error('❌ Fout bij opslaan gebruikersprofielen:', error.message);
    }
  }

  /**
   * ➕ Maak nieuw gebruikersprofiel aan
   * @param {string} userId - Unieke gebruikers-ID
   * @param {Object} profile - Profielgegevens
   * @returns {boolean} Success status
   */
  createUser(userId, profile) {
    try {
      const users = this.loadUsers();
      
      // Controleer of gebruiker al bestaat
      if (users[userId]) {
        console.error(`❌ Gebruiker ${userId} bestaat al`);
        return false;
      }

      // Valideer profielgegevens
      if (!this.validateProfile(profile)) {
        return false;
      }

      // Voeg timestamp toe
      const newProfile = {
        ...profile,
        createdAt: new Date().toISOString(),
        lastAlert: null
      };

      users[userId] = newProfile;
      this.saveUsers(users);
      
      console.log(`✅ Gebruiker ${userId} aangemaakt`);
      return true;
    } catch (error) {
      console.error(`❌ Fout bij aanmaken gebruiker ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * 🔄 Update bestaand gebruikersprofiel
   * @param {string} userId - Gebruikers-ID
   * @param {Object} updates - Te updaten velden
   * @returns {boolean} Success status
   */
  updateUser(userId, updates) {
    try {
      const users = this.loadUsers();
      
      if (!users[userId]) {
        console.error(`❌ Gebruiker ${userId} niet gevonden`);
        return false;
      }

      // Valideer updates
      if (updates.windWindow && !this.validateWindWindow(updates.windWindow)) {
        return false;
      }

      // Update profiel
      users[userId] = {
        ...users[userId],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveUsers(users);
      
      console.log(`✅ Gebruiker ${userId} geüpdatet`);
      return true;
    } catch (error) {
      console.error(`❌ Fout bij updaten gebruiker ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * 🗑️ Verwijder gebruikersprofiel
   * @param {string} userId - Gebruikers-ID
   * @returns {boolean} Success status
   */
  deleteUser(userId) {
    try {
      const users = this.loadUsers();
      
      if (!users[userId]) {
        console.error(`❌ Gebruiker ${userId} niet gevonden`);
        return false;
      }

      delete users[userId];
      this.saveUsers(users);
      
      console.log(`✅ Gebruiker ${userId} verwijderd`);
      return true;
    } catch (error) {
      console.error(`❌ Fout bij verwijderen gebruiker ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * 👤 Haal specifiek gebruikersprofiel op
   * @param {string} userId - Gebruikers-ID
   * @returns {Object|null} Gebruikersprofiel
   */
  getUser(userId) {
    try {
      const users = this.loadUsers();
      return users[userId] || null;
    } catch (error) {
      console.error(`❌ Fout bij ophalen gebruiker ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * 📋 Haal alle gebruikersprofielen op
   * @returns {Object} Alle gebruikersprofielen
   */
  getAllUsers() {
    return this.loadUsers();
  }

  /**
   * ✅ Valideer profielgegevens
   * @param {Object} profile - Te valideren profiel
   * @returns {boolean} Valid status
   */
  validateProfile(profile) {
    // Controleer verplichte velden
    if (!profile.phone || !profile.preferredSpots || !profile.windWindow) {
      console.error('❌ Verplichte velden ontbreken: phone, preferredSpots, windWindow');
      return false;
    }

    // Valideer telefoonnummer (basis check)
    if (!/^\+[1-9]\d{1,14}$/.test(profile.phone)) {
      console.error('❌ Ongeldig telefoonnummer formaat');
      return false;
    }

    // Valideer voorkeur spots
    if (!Array.isArray(profile.preferredSpots) || profile.preferredSpots.length === 0) {
      console.error('❌ preferredSpots moet een niet-lege array zijn');
      return false;
    }

    // Valideer wind window
    if (!this.validateWindWindow(profile.windWindow)) {
      return false;
    }

    return true;
  }

  /**
   * 🌪️ Valideer wind window instellingen
   * @param {Object} windWindow - Wind window object
   * @returns {boolean} Valid status
   */
  validateWindWindow(windWindow) {
    if (!windWindow.min || !windWindow.max) {
      console.error('❌ Wind window min/max ontbreekt');
      return false;
    }

    if (windWindow.min < 5 || windWindow.max > 60) {
      console.error('❌ Wind snelheid buiten bereik (5-60 kn)');
      return false;
    }

    if (windWindow.min >= windWindow.max) {
      console.error('❌ Min wind snelheid moet kleiner zijn dan max');
      return false;
    }

    return true;
  }

  /**
   * 📊 Haal statistieken op
   * @returns {Object} Profiel statistieken
   */
  getStats() {
    try {
      const users = this.loadUsers();
      const userIds = Object.keys(users);
      
      return {
        totalUsers: userIds.length,
        activeUsers: userIds.filter(id => users[id].notifications).length,
        averageMinWind: userIds.reduce((sum, id) => sum + users[id].windWindow.min, 0) / userIds.length,
        averageMaxWind: userIds.reduce((sum, id) => sum + users[id].windWindow.max, 0) / userIds.length,
        mostPopularSpots: this.getMostPopularSpots(users)
      };
    } catch (error) {
      console.error('❌ Fout bij ophalen statistieken:', error.message);
      return {};
    }
  }

  /**
   * 🏆 Bepaal populairste spots
   * @param {Object} users - Gebruikersprofielen
   * @returns {Array} Populairste spots
   */
  getMostPopularSpots(users) {
    const spotCounts = {};
    
    Object.values(users).forEach(user => {
      user.preferredSpots.forEach(spot => {
        spotCounts[spot] = (spotCounts[spot] || 0) + 1;
      });
    });

    return Object.entries(spotCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([spot, count]) => ({ spot, count }));
  }
}

// Export singleton instance
export const profileManager = new ProfileManager();
