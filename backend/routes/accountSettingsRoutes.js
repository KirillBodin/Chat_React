const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Модель пользователя
const bcrypt = require('bcrypt');

// Обновление настроек аккаунта
router.put('/:username', async (req, res) => {
    try {
        const { email, newPassword, currentPassword } = req.body;
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Проверка текущего пароля перед обновлением пароля
        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Хеширование нового пароля
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Обновляем email, если он предоставлен
        if (email) {
            user.email = email;
        }

        // Сохраняем изменения
        await user.save();

        res.json({ message: 'Account settings updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating account settings', error });
    }
});

module.exports = router;
