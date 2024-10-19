const admin = require('firebase-admin'); // Підключаємо Firebase Admin SDK для відправки push-сповіщень / Importing Firebase Admin SDK for sending push notifications
const serviceAccount = require('../path-to-your-firebase-key.json'); // Шлях до ключа сервісного аккаунта Firebase / Path to your Firebase service account key

// Ініціалізуємо Firebase додаток / Initializing Firebase app
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Використовуємо сертифікат для автентифікації / Using certificate for authentication
});

// Функція для відправки push-сповіщень / Function to send push notifications
const sendPushNotification = async (deviceToken, title, message) => {
    const payload = {
        notification: {
            title: title, // Заголовок сповіщення / Notification title
            body: message, // Тіло сповіщення / Notification body
        },
    };

    try {
        await admin.messaging().sendToDevice(deviceToken, payload); // Відправка push-сповіщення на пристрій / Sending push notification to the device
        console.log('Push notification sent successfully'); // Лог повідомлення про успішну відправку / Log success message
    } catch (error) {
        console.error('Error sending push notification:', error); // Лог помилки при відправці / Log error message
    }
};

module.exports = sendPushNotification; // Експортуємо функцію sendPushNotification / Exporting sendPushNotification function
