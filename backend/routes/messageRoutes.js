const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const Message = require('../models/Message'); // Підключаємо модель повідомлення / Importing the Message model
const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router

// Отримання всіх повідомлень для конкретної кімнати / Fetching all messages for a specific room
router.get('/:room', async (req, res) => {
    const { room } = req.params; // Отримуємо назву кімнати з параметрів запиту / Extract room name from request parameters

    try {
        // Отримуємо тільки повідомлення, пов'язані з цією кімнатою / Fetch only messages related to this specific room
        const roomMessages = await Message.findOne({ room });

        if (roomMessages && roomMessages.messages.length > 0) {
            console.log('Повідомлення для кімнати:', roomMessages.messages); // Лог повідомлень для відладки / Log room messages for debugging
            res.json(roomMessages.messages); // Повертаємо масив повідомлень / Return the array of messages directly
        } else {
            console.log('Повідомлень для кімнати не знайдено'); // Лог, якщо повідомлень немає / Log if no messages are found
            res.json([]); // Повертаємо порожній масив, якщо повідомлень немає / Return an empty array if no messages are found
        }
    } catch (error) {
        console.error('Помилка отримання повідомлень для кімнати:', error); // Лог помилки / Log error
        res.status(500).json({ message: 'Error fetching room messages', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Отримання особистих повідомлень між двома користувачами / Fetching private messages between two users
router.get('/private/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params; // Отримуємо імена двох користувачів з параметрів / Extract usernames from request parameters

    try {
        // Шукаємо повідомлення між двома користувачами / Searching for messages between two users
        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        });

        if (messages) {
            res.json(messages.flatMap(m => m.messages)); // Об'єднуємо всі повідомлення в один масив / Flatten all messages into a single array
        } else {
            res.json([]); // Якщо повідомлень немає, повертаємо порожній масив / If no messages, return an empty array
        }
    } catch (error) {
        console.error('Error fetching private messages:', error); // Лог помилки / Log error
        res.status(500).json({ message: 'Server error' }); // Повертаємо помилку сервера / Return server error
    }
});

// Маршрут для надсилання повідомлень (текст, аудіо, відео) / Route to send messages (text, audio, video)
router.post('/send', async (req, res) => {
    const { text, audioUrl, videoUrl, username, to } = req.body; // Отримуємо дані з тіла запиту / Extract data from request body

    if (username === to) {
        return res.status(400).json({ message: 'Cannot send a message to oneself' }); // Неможливо надіслати повідомлення собі / Cannot send message to oneself
    }

    try {
        let messageDocument = await Message.findOneAndUpdate(
            { sender: username, recipient: to }, // Шукаємо діалог між користувачами / Find conversation between users
            { $push: { messages: { text, audioUrl, videoUrl, username, timestamp: new Date() } } }, // Додаємо нове повідомлення / Push new message
            { new: true, upsert: true } // Створюємо документ, якщо його не існує / Create document if it doesn't exist
        );

        if (messageDocument) {
            res.status(200).json({ message: 'Message sent successfully' }); // Повертаємо успішне повідомлення / Return success message
        } else {
            res.status(400).json({ message: 'Error sending message' }); // Повертаємо помилку / Return error if sending failed
        }
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Пошук повідомлень у кімнаті за ключовим словом / Search messages in a room by keyword
router.get('/search/room/:room', async (req, res) => {
    const { room } = req.params; // Отримуємо кімнату з параметрів / Extract room from request parameters
    const { keyword } = req.query; // Отримуємо ключове слово з запиту / Extract keyword from query

    try {
        const roomMessages = await Message.findOne({ room });

        if (roomMessages) {
            const filteredMessages = roomMessages.messages.filter(msg =>
                msg.text.toLowerCase().includes(keyword.toLowerCase()) // Фільтруємо повідомлення за ключовим словом / Filter messages by keyword
            );
            res.json(filteredMessages); // Повертаємо відфільтровані повідомлення / Return filtered messages
        } else {
            res.json([]); // Якщо немає повідомлень, повертаємо порожній масив / If no messages, return an empty array
        }
    } catch (error) {
        res.status(500).json({ message: 'Error searching room messages', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Пошук особистих повідомлень за ключовим словом / Search private messages by keyword
router.get('/search/private/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params; // Отримуємо двох користувачів з параметрів / Extract two users from request parameters
    const { keyword } = req.query; // Отримуємо ключове слово з запиту / Extract keyword from query

    try {
        const privateMessages = await Message.findOne({
            users: { $all: [user1, user2] } // Шукаємо всі повідомлення між двома користувачами / Find all messages between the two users
        });

        if (privateMessages) {
            const filteredMessages = privateMessages.messages.filter(msg =>
                msg.text.toLowerCase().includes(keyword.toLowerCase()) // Фільтруємо повідомлення за ключовим словом / Filter messages by keyword
            );
            res.json(filteredMessages); // Повертаємо відфільтровані повідомлення / Return filtered messages
        } else {
            res.json([]); // Якщо немає повідомлень, повертаємо порожній масив / If no messages, return an empty array
        }
    } catch (error) {
        res.status(500).json({ message: 'Error searching private messages', error }); // Повертаємо помилку сервера / Return server error
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
