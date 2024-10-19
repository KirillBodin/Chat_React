const twilio = require('twilio'); // Підключаємо Twilio для відправки SMS / Importing Twilio for sending SMS

const accountSid = 'your-twilio-account-sid'; // Вкажіть ваш Twilio Account SID / Your Twilio Account SID
const authToken = 'your-twilio-auth-token'; // Вкажіть ваш Twilio Auth Token / Your Twilio Auth Token
const client = twilio(accountSid, authToken); // Ініціалізуємо клієнт Twilio / Initializing Twilio client

// Функція для відправки SMS / Function to send SMS
const sendSMS = async (to, message) => {
    try {
        await client.messages.create({
            body: message, // Текст повідомлення / Message body
            from: 'your-twilio-phone-number', // Номер відправника (ваш Twilio номер) / Your Twilio phone number (sender)
            to: to, // Номер отримувача / Recipient phone number
        });
        console.log('SMS sent successfully'); // Лог повідомлення про успішну відправку / Log success message
    } catch (error) {
        console.error('Error sending SMS:', error); // Лог помилки при відправці / Log error message
    }
};

module.exports = sendSMS; // Експортуємо функцію sendSMS / Exporting sendSMS function
