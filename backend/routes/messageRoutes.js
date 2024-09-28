const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Получение всех сообщений для конкретной комнаты
router.get('/messages/:room', async (req, res) => {
    const { room } = req.params;

    try {
        // Ищем все сообщения для комнаты
        const roomMessages = await Message.findOne({ room });

        if (roomMessages) {
            console.log('Сообщения для комнаты:', roomMessages.messages);  // Логируем сообщения для проверки
            res.json(roomMessages.messages);  // Возвращаем массив сообщений для комнаты
        } else {
            console.log('Сообщений для комнаты не найдено');
            res.json([]);  // Если сообщений нет, возвращаем пустой массив
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room messages', error });
    }
});

// Получение личных сообщений между двумя пользователями
router.get('/messages/private/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        // Ищем сообщения между двумя пользователями
        const privateMessages = await Message.findOne({
            users: { $all: [user1, user2] }
        });

        if (privateMessages) {
            console.log(`Messages between ${user1} and ${user2}:`, privateMessages.messages);
            res.json(privateMessages.messages);  // Возвращаем массив сообщений
        } else {
            res.json([]);  // Если сообщений нет, возвращаем пустой массив
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching private messages', error });
    }
});
// Получение личных сообщений между двумя пользователями
router.get('/messages/private/:from/:to', async (req, res) => {
    const { from, to } = req.params;

    try {
        const privateMessages = await Message.findOne({
            users: { $all: [from, to] }  // Ищем запись с обоими пользователями
        });

        if (privateMessages) {
            res.json(privateMessages.messages);  // Возвращаем массив сообщений
        } else {
            res.json([]);  // Если сообщений нет, возвращаем пустой массив
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching private messages', error });
    }
});

module.exports = router;
