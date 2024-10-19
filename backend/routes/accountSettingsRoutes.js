const express = require('express'); // Підключаємо Express для створення маршруту / Importing Express to create a route
const router = express.Router(); // Створюємо екземпляр маршрутизатора Express / Creating an instance of Express router
const User = require('../models/User'); // Підключаємо модель користувача / Importing the User model
const bcrypt = require('bcrypt'); // Підключаємо bcrypt для хешування паролів / Importing bcrypt for password hashing

// Оновлення налаштувань акаунта / Updating account settings
router.put('/:username', async (req, res) => {
    try {
        const { email, newPassword, currentPassword } = req.body; // Отримуємо email, новий та поточний паролі з тіла запиту / Extracting email, new password, and current password from request body
        const user = await User.findOne({ username: req.params.username }); // Шукаємо користувача за ім'ям / Finding user by username

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Якщо користувача не знайдено, повертаємо помилку / If user is not found, return an error
        }

        // Перевірка поточного паролю перед оновленням паролю / Checking current password before updating password
        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password); // Порівнюємо поточний пароль з збереженим паролем / Comparing current password with stored password
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' }); // Якщо паролі не співпадають, повертаємо помилку / If passwords do not match, return an error
            }

            // Хешуємо новий пароль / Hashing the new password
            const salt = await bcrypt.genSalt(10); // Генеруємо сіль для хешування / Generating salt for hashing
            user.password = await bcrypt.hash(newPassword, salt); // Хешуємо новий пароль / Hashing the new password
        }

        // Оновлюємо email, якщо він наданий / Updating email if provided
        if (email) {
            user.email = email;
        }

        // Зберігаємо зміни / Saving changes
        await user.save();

        res.json({ message: 'Account settings updated successfully', user }); // Повертаємо успішне повідомлення / Returning success message
    } catch (error) {
        res.status(500).json({ message: 'Error updating account settings', error }); // Обробляємо помилку при оновленні налаштувань / Handling error during account update
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
