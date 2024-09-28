const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Получение всех пользователей
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

module.exports = router;
