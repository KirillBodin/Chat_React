const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const User = require('../models/User'); // Підключаємо модель користувача / Importing User model
const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router
const multer = require('multer'); // Підключаємо Multer для завантаження файлів / Importing Multer for file uploads

// Налаштовуємо Multer для завантаження аватарок / Configure Multer for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars'); // Вказуємо директорію для збереження аватарок / Set directory for saving avatars
    },
    filename: (req, file, cb) => {
        // Якщо req.body.username недоступний, використовуємо фіксоване ім'я / If req.body.username is not available, use a fixed name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Генеруємо унікальний суфікс для імені файлу / Generate a unique suffix for the filename
        const username = req.body.username || 'unknown_user'; // Використовуємо ім'я користувача або фіксоване значення / Use username or fallback to 'unknown_user'
        cb(null, `${username}-${uniqueSuffix}-${file.originalname}`); // Формуємо ім'я файлу / Form the filename
    }
});

const upload = multer({ storage: storage }); // Налаштовуємо Multer для використання сховища / Configure Multer with the storage

// Маршрут для завантаження аватарки / Route for avatar upload
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
    try {
        // Логування даних запиту / Log request data
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' }); // Якщо файл не завантажено, повертаємо помилку / Return error if no file uploaded
        }

        // Оновлюємо дані користувача в базі / Update user data in the database
        const user = await User.findOneAndUpdate(
            { username: req.body.username }, // Знаходимо користувача за ім'ям / Find user by username
            { avatarUrl: `/uploads/avatars/${req.file.filename}` }, // Зберігаємо URL до аватара / Save avatar URL
            { new: true } // Повертаємо оновленого користувача / Return updated user
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Якщо користувача не знайдено, повертаємо помилку / Return error if user not found
        }

        // Логування оновленого користувача / Log updated user
        console.log('Updated user:', user);

        // Повертаємо успішний результат / Return success response
        res.json({ message: 'Avatar uploaded successfully', avatarUrl: user.avatarUrl });
    } catch (error) {
        // Логування помилки / Log error
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Error uploading avatar', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Отримання всіх користувачів / Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Отримуємо всіх користувачів з бази / Fetch all users from the database
        res.json(users); // Повертаємо користувачів у відповідь / Return users in response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Отримання профілю користувача за ім'ям / Get user profile by username
router.get('/:username', async (req, res) => {
    const { username } = req.params; // Отримуємо ім'я користувача з параметрів запиту / Extract username from request parameters

    try {
        const user = await User.findOne({ username }); // Шукаємо користувача за ім'ям / Find user by username
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Якщо користувача не знайдено, повертаємо помилку / Return error if user not found
        }
        res.json(user); // Повертаємо профіль користувача / Return user profile
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Оновлення біографії користувача / Update user bio
router.put('/:username/bio', async (req, res) => {
    const { username } = req.params; // Отримуємо ім'я користувача з параметрів запиту / Extract username from request parameters
    const { bio } = req.body; // Отримуємо біографію з тіла запиту / Extract bio from request body

    try {
        const user = await User.findOneAndUpdate({ username }, { bio }, { new: true }); // Оновлюємо біографію користувача / Update user's bio
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Якщо користувача не знайдено, повертаємо помилку / Return error if user not found
        }
        res.json(user); // Повертаємо оновлений профіль користувача / Return updated user profile
    } catch (error) {
        res.status(500).json({ message: 'Error updating bio', error }); // Повертаємо помилку сервера / Return server error
    }
});

module.exports = router; // Експортуємо маршрутизатор / Export the router
