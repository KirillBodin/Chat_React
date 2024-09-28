const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message'); // Подключаем модель сообщений
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Подключение к MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chat-app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json());  // Для обработки JSON-запросов

// Подключаем маршруты
app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', messageRoutes);

const users = {}; // Сохраняем подключенных пользователей

io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    if (!username) {
        console.error('Username is undefined');
        socket.username = 'Unknown User';
    } else {
        socket.username = username;
        console.log(`User connected: ${username}`);
    }

    // Присоединение к комнате
    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.currentRoom = room;
        console.log(`User ${socket.username} joined room: ${room}`);
    });

    // Обработка отправки сообщения в комнату
    socket.on('message', async (msg) => {
        const { text, username, room } = msg;

        try {
            // Найти или создать запись для комнаты
            let roomMessages = await Message.findOne({ room });

            if (!roomMessages) {
                roomMessages = new Message({ room, messages: [] });
            }

            // Добавляем новое сообщение в массив сообщений комнаты
            roomMessages.messages.push({ text, username });
            await roomMessages.save();

            // Отправляем сообщение всем пользователям в комнате
            io.to(room).emit('message', { text, username, room });
            console.log(`Message sent to room ${room}: ${text}`);
        } catch (error) {
            console.error('Error saving room message:', error);
        }
    });

    // Обработка отправки личного сообщения
    socket.on('privateMessage', async ({ text, to }) => {
        console.log(`Private message event received from ${socket.username} to ${to}: ${text}`);

        try {
            let privateMessages = await Message.findOne({
                users: { $all: [socket.username, to] }
            });

            if (!privateMessages) {
                privateMessages = new Message({
                    users: [socket.username, to],
                    messages: []
                });
            }

            privateMessages.messages.push({ text, username: socket.username, seen: false });
            await privateMessages.save();

            const targetSocketId = users[to];
            if (targetSocketId) {
                io.to(targetSocketId).emit('privateMessage', { text, from: socket.username });
                console.log(`Message sent to ${to} from ${socket.username}: ${text}`);
            } else {
                console.log(`User ${to} is not connected. Message saved to database.`);
            }
        } catch (error) {
            console.error('Error saving private message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client ${socket.username} disconnected`);
        delete users[socket.username];
    });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
