const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router
const User = require('../models/User'); // Підключаємо модель користувача / Importing the User model
const nodemailer = require('nodemailer'); // Підключаємо nodemailer для відправки email / Importing nodemailer to send emails

// Функція для відправки email / Function to send an email
async function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Використовуємо сервіс Gmail для відправки / Using Gmail service for sending
        auth: {
            user: 'your-email@gmail.com', // Ваш email / Your email
            pass: 'your-email-password', // Ваш пароль від email / Your email password
        },
    });

    let info = await transporter.sendMail({
        from: '"ChatApp" <your-email@gmail.com>', // Відправник / Sender
        to: to, // Отримувач / Recipient
        subject: subject, // Тема листа / Email subject
        text: text, // Текст повідомлення / Email body
    });

    console.log('Message sent: %s', info.messageId); // Лог повідомлення про успішну відправку / Log message on successful send
}

// Отримання налаштувань сповіщень для конкретного користувача / Fetching notification settings for a specific user
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }); // Шукаємо користувача за ім'ям / Finding user by username
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Якщо користувач не знайдений, повертаємо помилку / Return error if user not found
        }

        res.json(user.notifications); // Повертаємо налаштування сповіщень / Return user's notification settings
    } catch (error) {
        res.status(500).json({ message: 'Server error', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Оновлення налаштувань сповіщень для конкретного користувача / Updating notification settings for a specific user
router.put('/:username', async (req, res) => {
    try {
        const { email, push, sms } = req.body; // Отримуємо дані з тіла запиту / Extract data from request body
        console.log('Updating notifications for:', req.params.username); // Логування оновлення сповіщень / Log updating notifications
        console.log('Received data:', req.body); // Логування отриманих даних / Log received data

        const user = await User.findOneAndUpdate(
            { username: req.params.username }, // Шукаємо користувача за ім'ям / Finding user by username
            {
                notifications: {
                    email: email !== undefined ? email : true, // Оновлюємо email-сповіщення / Update email notifications
                    push: push !== undefined ? push : true, // Оновлюємо push-сповіщення / Update push notifications
                    sms: sms !== undefined ? sms : false // Оновлюємо SMS-сповіщення / Update SMS notifications
                }
            },
            { new: true } // Повертаємо оновлений документ / Return updated document
        );

        if (!user) {
            console.log('User not found'); // Логування, якщо користувача не знайдено / Log if user not found
            return res.status(404).json({ message: 'User not found' }); // Повертаємо помилку, якщо користувача не знайдено / Return error if user not found
        }

        // Надсилаємо email про те, що налаштування сповіщень оновлені / Send an email notifying that notification settings were updated
        if (user.notifications.email) {
            console.log('Sending email to:', user.email); // Логування процесу відправки email / Log sending email
            await sendEmail(user.email, 'Notification Settings Updated', 'Your notification settings have been updated.');
        }

        res.json({ message: 'Notification settings updated', notifications: user.notifications }); // Повертаємо успішне повідомлення / Return success message
    } catch (error) {
        console.error('Error updating notification settings:', error); // Логування помилки оновлення налаштувань / Log error during settings update
        res.status(500).json({ message: 'Server error', error }); // Повертаємо помилку сервера / Return server error
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
