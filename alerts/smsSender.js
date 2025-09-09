/**
 * 📱 SMS Sender - SMS verzending via Twilio of email gateway
 * 
 * Stuurt SMS berichten via Twilio API of email-SMS gateway
 * 
 * @author Kitebuddy Team
 * @version 1.0
 */

// SMS Provider interface (JavaScript versie)
// class SMSProvider {
//   async sendSMS(to, message) {
//     throw new Error('Must be implemented');
//   }
// }

/**
 * 📞 Twilio SMS Provider
 * Professionele SMS service via Twilio API
 */
class TwilioSMSProvider {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async sendSMS(to, message) {
    try {
      // Voor nu: simulatie (vervang door echte Twilio implementatie)
      console.log(`📱 [TWILIO] SMS naar ${to}:`);
      console.log(`📝 Bericht: ${message}`);
      
      // Echte Twilio implementatie:
      // const client = require('twilio')(this.accountSid, this.authToken);
      // const result = await client.messages.create({
      //   body: message,
      //   from: this.fromNumber,
      //   to: to
      // });
      // console.log(`✅ Twilio SMS verzonden: ${result.sid}`);
      
      return true;
    } catch (error) {
      console.error('❌ Twilio SMS verzending mislukt:', error.message);
      return false;
    }
  }
}

/**
 * 📧 Email-SMS Gateway Provider
 * Gratis alternatief via email naar SMS conversie
 */
class EmailSMSProvider {
  constructor() {
    this.emailDomain = process.env.EMAIL_SMS_DOMAIN || 'sms.example.com';
  }

  async sendSMS(to, message) {
    try {
      // Simuleer email naar SMS gateway
      console.log(`📧 [EMAIL-SMS] Email naar ${to}@${this.emailDomain}:`);
      console.log(`📝 Bericht: ${message}`);
      
      // Echte email implementatie:
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransporter({
      //   host: 'smtp.gmail.com',
      //   port: 587,
      //   secure: false,
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS
      //   }
      // });
      // 
      // await transporter.sendMail({
      //   from: process.env.EMAIL_USER,
      //   to: `${to}@${this.emailDomain}`,
      //   subject: 'Kitebuddy Alert',
      //   text: message
      // });
      
      return true;
    } catch (error) {
      console.error('❌ Email-SMS verzending mislukt:', error.message);
      return false;
    }
  }
}

/**
 * 📱 SMS Sender Class
 * Hoofdklasse voor SMS verzending met provider selectie
 */
export class SMSSender {
  constructor() {
    this.provider = this.selectProvider();
  }

  /**
   * 🔌 Selecteer SMS provider op basis van configuratie
   * @returns {Object} Geselecteerde provider
   */
  selectProvider() {
    // Prioriteit: Twilio > Email-SMS > Console
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log('📱 SMS Provider: Twilio');
      return new TwilioSMSProvider();
    } else if (process.env.EMAIL_SMS_DOMAIN) {
      console.log('📧 SMS Provider: Email-SMS Gateway');
      return new EmailSMSProvider();
    } else {
      console.log('🖥️ SMS Provider: Console (development mode)');
      return new ConsoleSMSProvider();
    }
  }

  /**
   * 📤 Verzend SMS bericht
   * @param {string} to - Telefoonnummer ontvanger
   * @param {string} message - SMS bericht
   * @returns {Promise<boolean>} Success status
   */
  async sendSMS(to, message) {
    try {
      // Valideer telefoonnummer
      if (!this.validatePhoneNumber(to)) {
        console.error(`❌ Ongeldig telefoonnummer: ${to}`);
        return false;
      }

      // Valideer bericht
      if (!this.validateMessage(message)) {
        console.error('❌ Ongeldig bericht');
        return false;
      }

      // Verzend via geselecteerde provider
      const success = await this.provider.sendSMS(to, message);
      
      if (success) {
        console.log(`✅ SMS succesvol verzonden naar ${to}`);
        this.logSMS(to, message, true);
      } else {
        console.error(`❌ SMS verzending mislukt naar ${to}`);
        this.logSMS(to, message, false);
      }

      return success;

    } catch (error) {
      console.error('❌ Fout bij SMS verzending:', error.message);
      this.logSMS(to, message, false, error.message);
      return false;
    }
  }

  /**
   * 📤 Verzend bulk SMS berichten
   * @param {Array} messages - Array van {to, message} objecten
   * @returns {Promise<Object>} Resultaten
   */
  async sendBulkSMS(messages) {
    console.log(`📤 Bulk SMS verzending gestart: ${messages.length} berichten`);
    
    let success = 0;
    let failed = 0;

    for (const { to, message } of messages) {
      const result = await this.sendSMS(to, message);
      
      if (result) {
        success++;
      } else {
        failed++;
      }

      // Kleine pauze tussen berichten om rate limiting te voorkomen
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`📊 Bulk SMS voltooid: ${success} succesvol, ${failed} mislukt`);
    return { success, failed };
  }

  /**
   * ✅ Valideer telefoonnummer
   * @param {string} phone - Telefoonnummer
   * @returns {boolean} Valid status
   */
  validatePhoneNumber(phone) {
    // Basis validatie: +[landcode][nummer]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * ✅ Valideer SMS bericht
   * @param {string} message - SMS bericht
   * @returns {boolean} Valid status
   */
  validateMessage(message) {
    // Controleer of bericht niet leeg is en niet te lang
    return message && message.length > 0 && message.length <= 1600; // Max 10 SMS berichten
  }

  /**
   * 📝 Log SMS verzending
   * @param {string} to - Telefoonnummer
   * @param {string} message - Bericht
   * @param {boolean} success - Success status
   * @param {string} error - Error message (optioneel)
   */
  logSMS(to, message, success, error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      to: to,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''), // Truncate voor logging
      success: success,
      error: error || null,
      provider: this.provider.constructor.name
    };

    console.log(`📝 SMS Log:`, logEntry);
    
    // TODO: Sla log op in bestand of database
    // this.saveSMSLog(logEntry);
  }

  /**
   * 🔧 Test SMS verzending
   * @param {string} testPhone - Test telefoonnummer
   * @returns {Promise<boolean>} Test resultaat
   */
  async testSMS(testPhone) {
    const testMessage = `🧪 Kitebuddy SMS Test - ${new Date().toLocaleString('nl-NL')}`;
    
    console.log('🧪 SMS Test gestart...');
    const result = await this.sendSMS(testPhone, testMessage);
    
    if (result) {
      console.log('✅ SMS Test succesvol');
    } else {
      console.log('❌ SMS Test mislukt');
    }
    
    return result;
  }
}

/**
 * 🖥️ Console SMS Provider (development)
 * Logt SMS berichten naar console voor development/testing
 */
class ConsoleSMSProvider {
  async sendSMS(to, message) {
    console.log('\n' + '='.repeat(50));
    console.log('📱 CONSOLE SMS (Development Mode)');
    console.log('='.repeat(50));
    console.log(`📞 Naar: ${to}`);
    console.log(`📝 Bericht:`);
    console.log(message);
    console.log('='.repeat(50) + '\n');
    
    return true;
  }
}

// Export singleton instance
export const smsSender = new SMSSender();
