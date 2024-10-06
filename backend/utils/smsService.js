const twilio = require('twilio');

const accountSid = 'your-twilio-account-sid';
const authToken = 'your-twilio-auth-token';
const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
    try {
        await client.messages.create({
            body: message,
            from: 'your-twilio-phone-number',
            to: to,
        });
        console.log('SMS sent successfully');
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

module.exports = sendSMS;
