const express = require('express');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');

// Настраиваем Multer для загрузки аватарок
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        // Если req.body.username недоступен, передаем фиксированное имя
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.body.username || 'unknown_user';
        cb(null, `${username}-${uniqueSuffix}-${file.originalname}`);
    }
});


const upload = multer({ storage: storage });

// Маршрут для загрузки аватарки
// Маршрут для загрузки аватарки
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
    try {
        // Проверяем данные запроса
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Обновляем данные пользователя в базе
        const user = await User.findOneAndUpdate(
            { username: req.body.username },
            { avatarUrl: `/uploads/avatars/${req.file.filename}` }, // Сохраняем URL к аватару
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Логируем обновленного пользователя
        console.log('Updated user:', user);

        // Возвращаем успешный ответ
        res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatarUrl });
    } catch (error) {
        // Логируем ошибку
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Error uploading avatar', error });
    }
});

// Получение всех пользователей
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Получение профиля пользователя по имени
router.get('/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
});

// Маршрут для загрузки аватарки
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.body.username },
            { avatarUrl: `/uploads/avatars/${req.file.filename}` }, // Сохраняем URL к аватару
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user)
        res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Error uploading avatar', error });
    }
});


// Обновление биографии пользователя
router.put('/:username/bio', async (req, res) => {
    const { username } = req.params;
    const { bio } = req.body;

    try {
        const user = await User.findOneAndUpdate({ username }, { bio }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bio', error });
    }
});

module.exports = router;
