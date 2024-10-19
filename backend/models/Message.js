const mongoose = require('mongoose'); // Підключаємо бібліотеку Mongoose для роботи з MongoDB / Importing Mongoose library to work with MongoDB
const Schema = mongoose.Schema; // Створюємо схему Mongoose / Creating a Mongoose schema

// Модель Message / Message model
const messageSchema = new Schema({
    sender: String, // Поле для відправника / Field for sender
    recipient: String, // Поле для отримувача / Field for recipient
    room: String, // Назва кімнати (якщо застосовується) / Name of the room (if applicable)
    messages: [
        {
            text: String, // Поле для тексту повідомлення / Field for message text
            audioUrl: String, // Поле для збереження посилання на аудіофайл / Field to store the audio file URL
            videoUrl: String, // Поле для відео / Field for video
            username: String, // Ім'я користувача, який надіслав повідомлення / Username of the person who sent the message
            seen: { type: Boolean, default: false }, // Поле для позначки про перегляд повідомлення / Field to mark if the message was seen
            timestamp: { type: Date, default: Date.now } // Поле з часовою міткою / Field for timestamp
        }
    ]
});

const Message = mongoose.model('Message', messageSchema); // Створюємо модель на основі схеми / Creating the model based on the schema
module.exports = Message; // Експортуємо модель Message / Exporting the Message model
