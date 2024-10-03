const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Получение всех сообщений для конкретной комнаты
router.get('/:room', async (req, res) => {
    const { room } = req.params;

    try {
        const roomMessages = await Message.findOne({ room });

        if (roomMessages) {
            console.log('Сообщения для комнаты:', roomMessages.messages);
            res.json(roomMessages.messages);
        } else {
            console.log('Сообщений для комнаты не найдено');
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room messages', error });
    }
});

// Получение личных сообщений между двумя пользователями
router.get('/private/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const privateMessages = await Message.findOne({
            users: { $all: [user1, user2] }
        });

        if (privateMessages) {
            res.json(privateMessages.messages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching private messages', error });
    }
});

// Поиск сообщений в комнате по ключевому слову
router.get('/search/room/:room', async (req, res) => {
    const { room } = req.params;
    const { keyword } = req.query;

    try {
        const roomMessages = await Message.findOne({ room });

        if (roomMessages) {
            const filteredMessages = roomMessages.messages.filter(msg =>
                msg.text.toLowerCase().includes(keyword.toLowerCase())
            );
            res.json(filteredMessages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при поиске сообщений в комнате', error });
    }
});

// Поиск личных сообщений по ключевому слову
router.get('/search/private/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    const { keyword } = req.query;

    try {
        const privateMessages = await Message.findOne({
            users: { $all: [user1, user2] }
        });

        if (privateMessages) {
            const filteredMessages = privateMessages.messages.filter(msg =>
                msg.text.toLowerCase().includes(keyword.toLowerCase())
            );
            res.json(filteredMessages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при поиске личных сообщений', error });
    }
});

// Получение личных сообщений между двумя пользователями
router.get('/private/:from/:to', async (req, res) => {
    const { from, to } = req.params;

    try {
        const privateMessages = await Message.findOne({
            users: { $all: [from, to] }
        });

        if (privateMessages) {
            res.json(privateMessages.messages);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching private messages', error });
    }
});

// Маршрут для отправки сообщений (текст, аудио, видео)
router.post('/send', async (req, res) => {
    const { text, audioUrl, videoUrl, username, to, room } = req.body;

    try {
        let messageDocument;
        if (room) {
            messageDocument = await Message.findOneAndUpdate(
                { room },
                { $push: { messages: { text, audioUrl, videoUrl, username, timestamp: new Date() } } },
                { new: true, upsert: true }
            );
        } else if (to) {
            messageDocument = await Message.findOneAndUpdate(
                { users: { $all: [username, to] } },
                { $push: { messages: { text, audioUrl, videoUrl, username, timestamp: new Date() } } },
                { new: true, upsert: true }
            );
        }

        if (messageDocument) {
            res.status(200).json({ message: 'Message sent successfully' });
        } else {
            res.status(400).json({ message: 'Error sending message' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
});

module.exports = router;
