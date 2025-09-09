/**
 * 📱 SMS Service
 * Verzend SMS notificaties voor wind windows
 */

// SMS Provider interface
interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}

/**
 * 📞 Twilio SMS Provider
 */
class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Voor nu: simulatie (vervang door echte Twilio implementatie)
      console.log(`📱 SMS naar ${to}: ${message}`);
      
      // Echte Twilio implementatie:
      // const client = require('twilio')(this.accountSid, this.authToken);
      // await client.messages.create({
      //   body: message,
      //   from: this.fromNumber,
      //   to: to
      // });
      
      return true;
    } catch (error) {
      console.error('❌ SMS verzending mislukt:', error);
      return false;
    }
  }
}

/**
 * 📧 Email SMS Provider (fallback)
 */
class EmailSMSProvider implements SMSProvider {
  private emailDomain: string;

  constructor() {
    this.emailDomain = process.env.EMAIL_SMS_DOMAIN || 'sms.example.com';
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Simuleer email naar SMS gateway
      console.log(`📧 Email-SMS naar ${to}@${this.emailDomain}: ${message}`);
      return true;
    } catch (error) {
      console.error('❌ Email-SMS verzending mislukt:', error);
      return false;
    }
  }
}

/**
 * 📱 SMS Service Class
 */
export class SMSService {
  private provider: SMSProvider;

  constructor() {
    // Kies provider op basis van configuratie
    if (process.env.TWILIO_ACCOUNT_SID) {
      this.provider = new TwilioSMSProvider();
    } else {
      this.provider = new EmailSMSProvider();
    }
  }

  /**
   * 📤 Verzend wind window notificatie
   */
  async sendWindWindowNotification(
    phone: string,
    spotName: string,
    date: string,
    windSpeed: number,
    windDirection: number,
    windowStart: string,
    windowEnd: string,
    hoursAhead: number
  ): Promise<boolean> {
    const message = this.formatWindWindowMessage(
      spotName,
      date,
      windSpeed,
      windDirection,
      windowStart,
      windowEnd,
      hoursAhead
    );

    return await this.provider.sendSMS(phone, message);
  }

  /**
   * 📝 Formatteer wind window bericht
   */
  private formatWindWindowMessage(
    spotName: string,
    date: string,
    windSpeed: number,
    windDirection: number,
    windowStart: string,
    windowEnd: string,
    hoursAhead: number
  ): string {
    const directionText = this.getWindDirectionText(windDirection);
    const timeText = hoursAhead === 48 ? 'over 2 dagen' : 'morgen';
    
    return `🏄‍♂️ Kitebuddy Alert!
    
${spotName} - ${date}
Wind: ${windSpeed} kn uit ${directionText}
Window: ${windowStart}-${windowEnd}
${timeText} vanaf nu!

Kitebuddy.nl`;

  }

  /**
   * 🧭 Converteer wind richting naar tekst
   */
  private getWindDirectionText(direction: number): string {
    const directions = [
      'N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO',
      'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(direction / 22.5) % 16;
    return directions[index];
  }

  /**
   * 📊 Verzend bulk notificaties
   */
  async sendBulkNotifications(notifications: Array<{
    phone: string;
    spotName: string;
    date: string;
    windSpeed: number;
    windDirection: number;
    windowStart: string;
    windowEnd: string;
    hoursAhead: number;
  }>): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendWindWindowNotification(
        notification.phone,
        notification.spotName,
        notification.date,
        notification.windSpeed,
        notification.windDirection,
        notification.windowStart,
        notification.windowEnd,
        notification.hoursAhead
      );

      if (result) {
        success++;
      } else {
        failed++;
      }

      // Kleine pauze tussen berichten
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed };
  }
}

// Export singleton instance
export const smsService = new SMSService();
