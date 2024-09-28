const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // Замените на свой секретный ключ

// Логин пользователя
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Ищем пользователя в базе данных
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Сравниваем пароль
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Генерируем JWT токен
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
// Регистрация нового пользователя
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const newUser = new User({
            username,
            password: hashedPassword,
            role: role || 'user'  // Роль по умолчанию - 'user'
        });

        await newUser.save();

        // Генерируем JWT токен
        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ token, username: newUser.username, role: newUser.role });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});
module.exports = router;
