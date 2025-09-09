/**
 * ⏰ SMS Scheduler - Dagelijkse wind window checks
 * 
 * Controleert dagelijks op forecast matches en plant SMS alerts
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import fs from 'fs';
import path from 'path';
import { profileManager } from '../profiles/profileManager.js';
import { smsSender } from './smsSender.js';

// 📁 Bestandspaden
const FORECAST_FILE = path.join(process.cwd(), 'data', 'rawForecasts.json');

/**
 * ⏰ SMS Scheduler Class
 * Plant en beheert SMS alerts voor wind windows
 */
export class SMSScheduler {
  constructor() {
    this.alertHistory = new Map(); // Voorkom dubbele alerts
  }

  /**
   * 🔄 Voer dagelijkse check uit
   * @returns {Object} Check resultaten
   */
  async runDailyCheck() {
    console.log('🚀 SMS Scheduler gestart...');
    
    try {
      // Laad data
      const users = profileManager.getAllUsers();
      const forecasts = this.loadForecasts();
      
      if (!forecasts || forecasts.length === 0) {
        console.log('⚠️ Geen forecast data beschikbaar');
        return { alertsSent: 0, errors: 0 };
      }

      let alertsSent = 0;
      let errors = 0;

      // Check elke gebruiker
      for (const [userId, userProfile] of Object.entries(users)) {
        if (!userProfile.notifications) {
          console.log(`⏭️ Gebruiker ${userId} heeft notificaties uitgeschakeld`);
          continue;
        }

        try {
          const userAlerts = await this.checkUserForecasts(userId, userProfile, forecasts);
          alertsSent += userAlerts;
        } catch (error) {
          console.error(`❌ Fout bij check gebruiker ${userId}:`, error.message);
          errors++;
        }
      }

      console.log(`✅ Dagelijkse check voltooid: ${alertsSent} alerts verzonden, ${errors} fouten`);
      return { alertsSent, errors };

    } catch (error) {
      console.error('❌ Fout bij dagelijkse check:', error.message);
      return { alertsSent: 0, errors: 1 };
    }
  }

  /**
   * 👤 Check forecasts voor specifieke gebruiker
   * @param {string} userId - Gebruikers-ID
   * @param {Object} userProfile - Gebruikersprofiel
   * @param {Array} forecasts - Forecast data
   * @returns {number} Aantal verzonden alerts
   */
  async checkUserForecasts(userId, userProfile, forecasts) {
    console.log(`🔍 Check forecasts voor gebruiker ${userId}...`);
    
    let alertsSent = 0;
    const today = new Date();
    
    // Check voor 48h en 24h alerts
    const alertTimes = [
      { hours: 48, type: '48h' },
      { hours: 24, type: '24h' }
    ];

    for (const { hours, type } of alertTimes) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + Math.floor(hours / 24));
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Filter forecasts voor gebruiker
      const matchingForecasts = this.filterUserForecasts(
        userProfile, 
        forecasts, 
        targetDateStr
      );

      if (matchingForecasts.length > 0) {
        // Controleer of we al een alert hebben gestuurd
        const alertKey = `${userId}_${targetDateStr}_${type}`;
        if (this.alertHistory.has(alertKey)) {
          console.log(`⏭️ Alert al verzonden voor ${userId} op ${targetDateStr} (${type})`);
          continue;
        }

        // Stuur alert
        const alertSent = await this.sendUserAlert(
          userId, 
          userProfile, 
          matchingForecasts, 
          targetDateStr, 
          type
        );

        if (alertSent) {
          this.alertHistory.set(alertKey, new Date());
          alertsSent++;
        }
      }
    }

    return alertsSent;
  }

  /**
   * 🔍 Filter forecasts op basis van gebruikersvoorkeuren
   * @param {Object} userProfile - Gebruikersprofiel
   * @param {Array} forecasts - Forecast data
   * @param {string} targetDate - Doeldatum (YYYY-MM-DD)
   * @returns {Array} Gefilterde forecasts
   */
  filterUserForecasts(userProfile, forecasts, targetDate) {
    const { preferredSpots, windWindow } = userProfile;
    
    return forecasts.filter(forecast => {
      // Check datum
      const forecastDate = forecast.timestamp.split('T')[0];
      if (forecastDate !== targetDate) return false;

      // Check spot
      if (!preferredSpots.includes(forecast.spot)) return false;

      // Check wind snelheid
      if (forecast.speed < windWindow.min || forecast.speed > windWindow.max) return false;

      // Check kitesurf uren (06:00-22:00)
      const hour = new Date(forecast.timestamp).getHours();
      if (hour < 6 || hour > 22) return false;

      return true;
    });
  }

  /**
   * 📤 Verzend alert voor gebruiker
   * @param {string} userId - Gebruikers-ID
   * @param {Object} userProfile - Gebruikersprofiel
   * @param {Array} matchingForecasts - Gefilterde forecasts
   * @param {string} targetDate - Doeldatum
   * @param {string} alertType - Alert type (48h/24h)
   * @returns {boolean} Success status
   */
  async sendUserAlert(userId, userProfile, matchingForecasts, targetDate, alertType) {
    try {
      // Groepeer forecasts per spot
      const spotGroups = this.groupForecastsBySpot(matchingForecasts);
      
      // Maak alert bericht
      const message = this.createAlertMessage(spotGroups, targetDate, alertType);
      
      // Verzend SMS
      const success = await smsSender.sendSMS(userProfile.phone, message);
      
      if (success) {
        console.log(`✅ Alert verzonden naar ${userId} voor ${targetDate} (${alertType})`);
        
        // Update lastAlert timestamp
        profileManager.updateUser(userId, { lastAlert: new Date().toISOString() });
        
        return true;
      } else {
        console.error(`❌ SMS verzending mislukt voor ${userId}`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Fout bij verzenden alert voor ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * 📊 Groepeer forecasts per spot
   * @param {Array} forecasts - Forecast data
   * @returns {Object} Gegroepeerde forecasts
   */
  groupForecastsBySpot(forecasts) {
    const groups = {};
    
    forecasts.forEach(forecast => {
      if (!groups[forecast.spot]) {
        groups[forecast.spot] = [];
      }
      groups[forecast.spot].push(forecast);
    });

    return groups;
  }

  /**
   * 📝 Maak alert bericht
   * @param {Object} spotGroups - Gegroepeerde forecasts per spot
   * @param {string} targetDate - Doeldatum
   * @param {string} alertType - Alert type
   * @returns {string} Geformatteerd bericht
   */
  createAlertMessage(spotGroups, targetDate, alertType) {
    const timeText = alertType === '48h' ? 'over 2 dagen' : 'morgen';
    const dateObj = new Date(targetDate);
    const dayName = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][dateObj.getDay()];
    
    let message = `🔥 Kitebuddy Alert!\n\n`;
    message += `${timeText} (${dayName}) ziet er top uit:\n\n`;

    // Voeg elke spot toe
    Object.entries(spotGroups).forEach(([spotName, forecasts], index) => {
      const avgSpeed = Math.round(forecasts.reduce((sum, f) => sum + f.speed, 0) / forecasts.length);
      const avgDirection = Math.round(forecasts.reduce((sum, f) => sum + f.dir, 0) / forecasts.length);
      const directionText = this.getWindDirectionText(avgDirection);
      
      // Bepaal beste tijdvenster
      const timeWindow = this.getBestTimeWindow(forecasts);
      
      message += `${spotName}: ${avgSpeed} kn uit ${directionText}\n`;
      message += `Window: ${timeWindow}\n`;
      
      if (index < Object.keys(spotGroups).length - 1) {
        message += '\n';
      }
    });

    message += `\nPak je gear! 🏄‍♂️\nKitebuddy.nl`;

    return message;
  }

  /**
   * 🕐 Bepaal beste tijdvenster
   * @param {Array} forecasts - Forecast data voor één spot
   * @returns {string} Tijdvenster string
   */
  getBestTimeWindow(forecasts) {
    if (forecasts.length === 0) return 'Geen data';

    // Sorteer op tijd
    const sortedForecasts = forecasts.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const startTime = new Date(sortedForecasts[0].timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = new Date(sortedForecasts[sortedForecasts.length - 1].timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${startTime}-${endTime}`;
  }

  /**
   * 🧭 Converteer wind richting naar tekst
   * @param {number} direction - Wind richting in graden
   * @returns {string} Richting tekst
   */
  getWindDirectionText(direction) {
    const directions = [
      'N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO',
      'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(direction / 22.5) % 16;
    return directions[index];
  }

  /**
   * 📖 Laad forecast data
   * @returns {Array} Forecast data
   */
  loadForecasts() {
    try {
      if (!fs.existsSync(FORECAST_FILE)) {
        console.log('⚠️ Forecast bestand niet gevonden');
        return [];
      }

      const data = fs.readFileSync(FORECAST_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Fout bij laden forecasts:', error.message);
      return [];
    }
  }

  /**
   * 🧹 Clear alert history (voor testing)
   */
  clearAlertHistory() {
    this.alertHistory.clear();
    console.log('🧹 Alert history gewist');
  }
}

// Export singleton instance
export const smsScheduler = new SMSScheduler();
