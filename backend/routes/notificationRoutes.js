const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
// Функция для отправки email (добавлена в код)
async function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    let info = await transporter.sendMail({
        from: '"ChatApp" <your-email@gmail.com>',
        to: to,
        subject: subject,
        text: text,
    });

    console.log('Message sent: %s', info.messageId);
}
// Получение настроек уведомлений для конкретного пользователя
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Обновление настроек уведомлений для конкретного пользователя
// Обновление настроек уведомлений для конкретного пользователя
router.put('/:username', async (req, res) => {
    try {
        const { email, push, sms } = req.body;
        console.log('Updating notifications for:', req.params.username);
        console.log('Received data:', req.body);

        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            {
                notifications: {
                    email: email !== undefined ? email : true,
                    push: push !== undefined ? push : true,
                    sms: sms !== undefined ? sms : false
                }
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Отправляем уведомление на email о том, что настройки обновлены
        if (user.notifications.email) {
            console.log('Sending email to:', user.email);
            await sendEmail(user.email, 'Notification Settings Updated', 'Your notification settings have been updated.');
        }

        res.json({ message: 'Notification settings updated', notifications: user.notifications });
    } catch (error) {
        console.error('Error updating notification settings:', error);  // Логирование ошибки
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;
