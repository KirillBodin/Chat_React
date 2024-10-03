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
        cb(null, `${req.body.username}-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Маршрут для загрузки аватарки
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.body.username },
            { avatar: `/uploads/avatars/${req.file.filename}` },
            { new: true }
        );
        res.json({ message: 'Avatar uploaded successfully', avatar: user.avatar });
    } catch (error) {
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
