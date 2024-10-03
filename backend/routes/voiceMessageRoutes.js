const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message'); // Подключаем модель сообщений
const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio'); // Папка для сохранения аудиофайлов
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname); // Получаем расширение файла
        const filename = `${Date.now()}${extension || '.wav'}`; // Генерируем имя файла с расширением
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Маршрут для загрузки аудиофайлов и сохранения сообщения
router.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        const audioUrl = `/uploads/audio/${req.file.filename}`;
        const { username, to } = req.body; // Получаем данные для отправки сообщения

        // Сохранение сообщения в базе данных
        const newMessage = await Message.findOneAndUpdate(
            { users: { $all: [username, to] } },
            {
                $push: {
                    messages: {
                        audioUrl,
                        username,
                        timestamp: new Date()
                    }
                }
            },
            { new: true, upsert: true } // Создать новый документ, если не найден
        );

        if (newMessage) {
            res.status(200).json({ message: 'Audio uploaded and message sent successfully', audioUrl });
        } else {
            res.status(400).json({ message: 'Error saving message' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading audio file or saving message', error });
    }
});

// Маршрут для получения аудиофайлов
router.get('/audio/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/audio', req.params.filename);

    // Проверяем, существует ли файл
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'Audio file not found' });
        }

        // Устанавливаем заголовки для передачи аудиофайла
        res.setHeader('Content-Type', 'audio/wav');

        // Передаем файл через поток
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

// Маршрут для отправки текстового сообщения
router.post('/private', async (req, res) => {
    try {
        const { text, username, to } = req.body;

        if (!text || !username || !to) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Сохранение личного текстового сообщения
        const newMessage = await Message.findOneAndUpdate(
            { users: { $all: [username, to] } },
            {
                $push: {
                    messages: {
                        text,
                        username,
                        timestamp: new Date()
                    }
                }
            },
            { new: true, upsert: true } // Создать новый документ, если не найден
        );

        if (newMessage) {
            res.status(200).json({ message: 'Message sent successfully' });
        } else {
            res.status(400).json({ message: 'Error saving message' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
});

module.exports = router;
