/**
 * 🧪 Test Profile System - Test het complete profiel en SMS systeem
 * 
 * Test alle componenten van het profiel en SMS notificatie systeem
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

import { profileManager } from '../profiles/profileManager.js';
import { smsScheduler } from '../alerts/smsScheduler.js';
import { smsSender } from '../alerts/smsSender.js';

/**
 * 🧪 Test Runner Class
 * Voert alle tests uit voor het profiel systeem
 */
class ProfileSystemTester {
  constructor() {
    this.testResults = [];
  }

  /**
   * 🚀 Voer alle tests uit
   */
  async runAllTests() {
    console.log('🧪 Profile System Tests gestart...\n');

    // Test 1: Profile Manager
    await this.testProfileManager();

    // Test 2: SMS Sender
    await this.testSMSSender();

    // Test 3: SMS Scheduler
    await this.testSMSScheduler();

    // Test 4: Integratie test
    await this.testIntegration();

    // Toon resultaten
    this.showResults();
  }

  /**
   * 👤 Test Profile Manager
   */
  async testProfileManager() {
    console.log('📋 Test 1: Profile Manager');
    
    try {
      // Test 1.1: Gebruiker aanmaken
      const testUser = {
        phone: '+31612345678',
        preferredSpots: ['Wijk aan Zee', 'Katwijk'],
        windWindow: { min: 15, max: 35 },
        notifications: true
      };

      const createResult = profileManager.createUser('test_user', testUser);
      this.addResult('Profile Manager - Gebruiker aanmaken', createResult);

      // Test 1.2: Gebruiker ophalen
      const getUserResult = profileManager.getUser('test_user') !== null;
      this.addResult('Profile Manager - Gebruiker ophalen', getUserResult);

      // Test 1.3: Gebruiker updaten
      const updateResult = profileManager.updateUser('test_user', {
        windWindow: { min: 12, max: 30 }
      });
      this.addResult('Profile Manager - Gebruiker updaten', updateResult);

      // Test 1.4: Statistieken
      const stats = profileManager.getStats();
      const statsResult = stats.totalUsers > 0;
      this.addResult('Profile Manager - Statistieken', statsResult);

      console.log('✅ Profile Manager tests voltooid\n');

    } catch (error) {
      console.error('❌ Profile Manager test fout:', error.message);
      this.addResult('Profile Manager - Algemeen', false);
    }
  }

  /**
   * 📱 Test SMS Sender
   */
  async testSMSSender() {
    console.log('📱 Test 2: SMS Sender');
    
    try {
      // Test 2.1: Enkele SMS
      const singleSMSResult = await smsSender.sendSMS(
        '+31612345678',
        '🧪 Test SMS van Kitebuddy!'
      );
      this.addResult('SMS Sender - Enkele SMS', singleSMSResult);

      // Test 2.2: Bulk SMS
      const bulkMessages = [
        { to: '+31612345678', message: 'Bulk test 1' },
        { to: '+31687654321', message: 'Bulk test 2' }
      ];
      const bulkResult = await smsSender.sendBulkSMS(bulkMessages);
      this.addResult('SMS Sender - Bulk SMS', bulkResult.success > 0);

      // Test 2.3: Telefoonnummer validatie
      const validPhone = smsSender.validatePhoneNumber('+31612345678');
      const invalidPhone = !smsSender.validatePhoneNumber('invalid');
      this.addResult('SMS Sender - Telefoonnummer validatie', validPhone && invalidPhone);

      // Test 2.4: Bericht validatie
      const validMessage = smsSender.validateMessage('Test bericht');
      const invalidMessage = !smsSender.validateMessage('');
      this.addResult('SMS Sender - Bericht validatie', validMessage && invalidMessage);

      console.log('✅ SMS Sender tests voltooid\n');

    } catch (error) {
      console.error('❌ SMS Sender test fout:', error.message);
      this.addResult('SMS Sender - Algemeen', false);
    }
  }

  /**
   * ⏰ Test SMS Scheduler
   */
  async testSMSScheduler() {
    console.log('⏰ Test 3: SMS Scheduler');
    
    try {
      // Test 3.1: Forecast filtering
      const mockForecasts = [
        {
          timestamp: '2025-01-21T14:00:00',
          spot: 'Wijk aan Zee',
          speed: 20,
          dir: 240
        },
        {
          timestamp: '2025-01-21T15:00:00',
          spot: 'Wijk aan Zee',
          speed: 18,
          dir: 245
        }
      ];

      const mockUserProfile = {
        preferredSpots: ['Wijk aan Zee'],
        windWindow: { min: 15, max: 35 },
        notifications: true
      };

      const filteredForecasts = smsScheduler.filterUserForecasts(
        mockUserProfile,
        mockForecasts,
        '2025-01-21'
      );

      const filterResult = filteredForecasts.length > 0;
      this.addResult('SMS Scheduler - Forecast filtering', filterResult);

      // Test 3.2: Alert message creation
      const spotGroups = smsScheduler.groupForecastsBySpot(filteredForecasts);
      const message = smsScheduler.createAlertMessage(spotGroups, '2025-01-21', '24h');
      const messageResult = message.includes('Kitebuddy Alert');
      this.addResult('SMS Scheduler - Alert message creation', messageResult);

      console.log('✅ SMS Scheduler tests voltooid\n');

    } catch (error) {
      console.error('❌ SMS Scheduler test fout:', error.message);
      this.addResult('SMS Scheduler - Algemeen', false);
    }
  }

  /**
   * 🔗 Test Integratie
   */
  async testIntegration() {
    console.log('🔗 Test 4: Integratie Test');
    
    try {
      // Test 4.1: Complete workflow
      const testUser = {
        phone: '+31612345678',
        preferredSpots: ['Wijk aan Zee'],
        windWindow: { min: 15, max: 35 },
        notifications: true
      };

      // Maak test gebruiker
      const createResult = profileManager.createUser('integration_test', testUser);
      
      if (createResult) {
        // Test SMS verzending
        const smsResult = await smsSender.sendSMS(
          testUser.phone,
          '🔗 Integratie test succesvol!'
        );
        
        this.addResult('Integratie - Complete workflow', smsResult);
      } else {
        this.addResult('Integratie - Complete workflow', false);
      }

      console.log('✅ Integratie tests voltooid\n');

    } catch (error) {
      console.error('❌ Integratie test fout:', error.message);
      this.addResult('Integratie - Algemeen', false);
    }
  }

  /**
   * ➕ Voeg test resultaat toe
   */
  addResult(testName, success) {
    this.testResults.push({ testName, success });
    console.log(`${success ? '✅' : '❌'} ${testName}`);
  }

  /**
   * 📊 Toon test resultaten
   */
  showResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTATEN');
    console.log('='.repeat(50));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 Totaal: ${totalTests} tests`);
    console.log(`✅ Geslaagd: ${passedTests}`);
    console.log(`❌ Gefaald: ${failedTests}`);
    console.log(`📊 Succes rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    console.log('='.repeat(50));

    if (failedTests === 0) {
      console.log('\n🎉 Alle tests geslaagd! Het profiel systeem werkt correct.');
    } else {
      console.log('\n⚠️ Sommige tests gefaald. Controleer de implementatie.');
    }
  }

  /**
   * 🧹 Cleanup test data
   */
  cleanup() {
    try {
      // Verwijder test gebruikers
      profileManager.deleteUser('test_user');
      profileManager.deleteUser('integration_test');
      
      // Clear alert history
      smsScheduler.clearAlertHistory();
      
      console.log('🧹 Test data opgeruimd');
    } catch (error) {
      console.error('❌ Cleanup fout:', error.message);
    }
  }
}

/**
 * 🚀 Hoofdfunctie
 */
async function main() {
  const tester = new ProfileSystemTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test runner fout:', error.message);
  } finally {
    // Cleanup
    tester.cleanup();
  }
}

// Start tests als script direct wordt uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProfileSystemTester };
