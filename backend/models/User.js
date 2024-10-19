const mongoose = require('mongoose'); // Підключаємо бібліотеку Mongoose для роботи з MongoDB / Importing Mongoose library to work with MongoDB
const Schema = mongoose.Schema; // Створюємо схему Mongoose / Creating a Mongoose schema

// Схема для моделі User / Schema for User model
const userSchema = new Schema({
    email: {
        type: String,
        required: true, // Поле для email, обов'язкове / Field for email, required
        unique: true // Email має бути унікальним / Email must be unique
    },
    username: {
        type: String,
        required: true, // Поле для імені користувача, обов'язкове / Field for username, required
        unique: true // Ім'я користувача має бути унікальним / Username must be unique
    },
    password: {
        type: String,
        required: true // Поле для паролю, обов'язкове / Field for password, required
    },
    role: {
        type: String,
        default: 'user' // Поле для типу користувача, за замовчуванням 'user' / Field for user role, default is 'user'
    },
    rooms: [{
        type: String // Список кімнат, у яких перебуває користувач / List of rooms the user is part of
    }],
    avatarUrl: {
        type: String // Поле для URL аватарки користувача / Field for user's avatar URL
    },
    bio: {
        type: String // Коротка біографія або опис користувача / Short bio or description of the user
    },
    notifications: {
        email: { type: Boolean, default: true }, // Повідомлення електронною поштою / Email notifications
        push: { type: Boolean, default: true }, // Push-повідомлення / Push notifications
        sms: { type: Boolean, default: false } // SMS-повідомлення, за замовчуванням вимкнено / SMS notifications, default is false
    }
}, { timestamps: true }); // Автоматично додає поля createdAt і updatedAt / Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema); // Створюємо модель на основі схеми / Creating the model based on the schema

module.exports = User; // Експортуємо модель User / Exporting the User model
