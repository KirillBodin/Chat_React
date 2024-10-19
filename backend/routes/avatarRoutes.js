const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const multer = require('multer'); // Підключаємо Multer для завантаження файлів / Importing Multer for file uploads
const path = require('path'); // Підключаємо path для роботи зі шляхами файлів / Importing path for file path operations

const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router

// Налаштування Multer для завантаження файлів / Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Директорія для збереження зображень / Directory where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.username}-${Date.now()}${path.extname(file.originalname)}`); // Ім'я файлу буде створене з імені користувача та мітки часу / Filename created from username and timestamp
    }
});
const upload = multer({ storage: storage }); // Використовуємо створене сховище для Multer / Using the created storage configuration for Multer

// Маршрут для завантаження аватара / Route to upload avatar
router.post('/upload', upload.single('avatar'), (req, res) => {
    try {
        res.status(200).json({
            message: 'Avatar uploaded successfully', // Повідомлення про успішне завантаження / Success message
            avatarUrl: `/uploads/${req.file.filename}`  // URL завантаженого зображення / URL of the uploaded image
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar', error }); // Обробляємо помилку при завантаженні аватара / Handle error during avatar upload
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
