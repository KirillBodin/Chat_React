const admin = require('firebase-admin');
const serviceAccount = require('../path-to-your-firebase-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (deviceToken, title, message) => {
    const payload = {
        notification: {
            title: title,
            body: message,
        },
    };

    try {
        await admin.messaging().sendToDevice(deviceToken, payload);
        console.log('Push notification sent successfully');
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

module.exports = sendPushNotification;
