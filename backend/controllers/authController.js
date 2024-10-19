const User = require('../models/User'); // Підключаємо модель користувача / Connecting the user model
const jwt = require('jsonwebtoken'); // Підключаємо бібліотеку для генерації JWT токенів / Importing library for JWT token generation
const SECRET_KEY = 'your_secret_key'; // Використовуйте ваш секретний ключ / Use your secret key

// Реєстрація користувача / User registration
exports.register = async (req, res) => {
    const { username, password } = req.body; // Отримуємо ім'я користувача та пароль з тіла запиту / Extract username and password from request body

    try {
        const existingUser = await User.findOne({ username }); // Перевіряємо, чи існує вже користувач з таким іменем / Check if a user with this username already exists
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' }); // Якщо існує, повертаємо помилку / If user exists, return error
        }

        const newUser = new User({ username, password }); // Створюємо нового користувача / Create a new user
        await newUser.save(); // Зберігаємо нового користувача в базі даних / Save new user to database
        res.status(201).json({ message: 'User registered successfully' }); // Повертаємо успішне повідомлення / Return success message
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error }); // Обробляємо помилку при реєстрації / Handle registration error
    }
};

// Авторизація користувача / User login
exports.login = async (req, res) => {
    const { username, password } = req.body; // Отримуємо ім'я користувача та пароль з тіла запиту / Extract username and password from request body

    try {
        const user = await User.findOne({ username }); // Шукаємо користувача за ім'ям / Find user by username
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Якщо користувача не знайдено або пароль неправильний, повертаємо помилку / If user not found or password is incorrect, return error
        }

        // Генерація JWT токена / Generating JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' }); // Генеруємо токен з ідентифікатором користувача і терміном дії 1 годину / Generate token with user ID and expiration time of 1 hour
        res.json({ token }); // Повертаємо токен як відповідь / Return token as response
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error }); // Обробляємо помилку при авторизації / Handle login error
    }
};
