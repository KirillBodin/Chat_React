const jwt = require('jsonwebtoken'); // Підключаємо бібліотеку для роботи з JWT / Importing library for working with JWT
const SECRET_KEY = 'your_secret_key'; // Замініть на свій секретний ключ / Replace with your secret key

// Перевірка JWT токену / JWT token verification
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Отримуємо токен з заголовка запиту / Retrieve token from request headers
    if (!token) {
        return res.status(403).json({ message: 'No token provided' }); // Якщо токен не надано, повертаємо помилку / If no token provided, return error
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => { // Перевіряємо токен за допомогою секретного ключа / Verify token using the secret key
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' }); // Якщо токен не валідний, повертаємо помилку / If token is invalid, return error
        }
        req.userId = decoded.userId; // Зберігаємо ідентифікатор користувача з токена в запиті / Save user ID from token in request
        next(); // Переходимо до наступного middleware / Proceed to the next middleware
    });
};
