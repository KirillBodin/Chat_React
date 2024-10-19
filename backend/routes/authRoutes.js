const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const User = require('../models/User'); // Підключаємо модель користувача / Importing User model
const bcrypt = require('bcryptjs'); // Підключаємо bcrypt для хешування паролів / Importing bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Підключаємо бібліотеку для генерації JWT токенів / Importing library for JWT token generation

const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router
const SECRET_KEY = 'your_secret_key'; // Замініть на свій секретний ключ / Replace with your secret key

// Логін користувача / User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Отримуємо ім'я користувача та пароль з тіла запиту / Extract username and password from request body

    try {
        // Шукаємо користувача в базі даних / Searching for the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Якщо користувача не знайдено, повертаємо помилку / If user is not found, return error
        }

        // Порівнюємо пароль / Comparing password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Якщо паролі не співпадають, повертаємо помилку / If passwords don't match, return error
        }

        // Генеруємо JWT токен / Generating JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username, role: user.role }); // Повертаємо токен, ім'я користувача та роль / Return token, username, and role
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error }); // Обробляємо помилку при вході в систему / Handle login error
    }
});

// Реєстрація нового користувача / Registering a new user
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body; // Отримуємо дані з тіла запиту / Extract data from request body

    try {
        // Перевіряємо, чи існує користувач / Checking if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' }); // Якщо користувач існує, повертаємо помилку / If user exists, return error
        }

        // Хешуємо пароль / Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Створюємо нового користувача / Creating a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            role: role || 'user' // Роль за замовчуванням - 'user' / Default role is 'user'
        });

        await newUser.save();

        // Генеруємо JWT токен / Generating JWT token
        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ token, username: newUser.username, role: newUser.role }); // Повертаємо токен, ім'я користувача та роль / Return token, username, and role
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error }); // Обробляємо помилку при реєстрації / Handle registration error
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
