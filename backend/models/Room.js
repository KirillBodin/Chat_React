const mongoose = require('mongoose'); // Підключаємо бібліотеку Mongoose для роботи з MongoDB / Importing Mongoose library to work with MongoDB

// Схема для моделі Room / Schema for Room model
const roomSchema = new mongoose.Schema({
    name: {
        type: String, // Поле для назви кімнати / Field for room name
        required: true, // Назва кімнати є обов'язковою / Room name is required
        unique: true // Назва кімнати має бути унікальною / Room name must be unique
    },
    createdAt: {
        type: Date, // Поле для збереження дати створення / Field for storing the creation date
        default: Date.now // За замовчуванням використовує поточну дату / Default to current date
    }
});

const Room = mongoose.model('Room', roomSchema); // Створюємо модель на основі схеми / Creating the model based on the schema

module.exports = Room; // Експортуємо модель Room / Exporting the Room model
