const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    users: [String], // Массив двух пользователей для личных сообщений
    room: String, // Название комнаты (если применимо)
    messages: [
        {
            text: String,
            audioUrl: String, // Поле для хранения ссылки на аудиофайл
            videoUrl: String, // Поле для видео (если добавите видео в будущем)
            username: String, // Имя пользователя, отправившего сообщение
            seen: { type: Boolean, default: false },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
