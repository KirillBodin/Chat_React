const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Замените на свой секретный ключ

// Проверка JWT
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId;
        next();
    });
};
