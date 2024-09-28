const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    users: [String], // Массив двух пользователей для личных сообщений (если применимо)
    room: String, // Название комнаты для сообщений в комнате (если применимо)
    messages: [
        {
            text: String,
            username: String, // Имя пользователя, отправившего сообщение
            seen: { type: Boolean, default: false },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
