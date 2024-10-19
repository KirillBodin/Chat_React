const express = require('express'); // Підключаємо Express для створення маршрутизатора / Importing Express to create a router
const router = express.Router(); // Створюємо маршрутизатор Express / Creating an Express router
const Room = require('../models/Room'); // Імпортуємо модель кімнати / Importing the Room model

// Отримати всі кімнати / Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find(); // Отримуємо всі кімнати з бази даних / Fetch all rooms from the database
        res.json(rooms); // Повертаємо список кімнат / Return the list of rooms
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Створити нову кімнату / Create a new room
router.post('/', async (req, res) => {
    const { name } = req.body; // Отримуємо назву кімнати з тіла запиту / Extract room name from request body
    try {
        const existingRoom = await Room.findOne({ name }); // Перевіряємо, чи існує кімната / Check if the room already exists
        if (existingRoom) {
            return res.status(400).json({ message: 'Room already exists' }); // Якщо кімната існує, повертаємо помилку / Return error if room exists
        }
        const room = new Room({ name }); // Створюємо нову кімнату / Create a new room
        await room.save(); // Зберігаємо кімнату в базі даних / Save room to the database
        res.status(201).json({ message: 'Room created successfully', room }); // Повертаємо успішне повідомлення та кімнату / Return success message and the room
    } catch (error) {
        res.status(500).json({ message: 'Error creating room', error }); // Повертаємо помилку сервера / Return server error
    }
});

module.exports = router; // Експортуємо маршрутизатор / Exporting the router
