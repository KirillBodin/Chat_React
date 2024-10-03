const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Для корректной работы с путями
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const voiceMessageRoutes = require('./routes/voiceMessageRoutes');
const Message = require('./models/Message'); // Модель сообщения

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000', // Позволяем запросы с фронтенда
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Подключение к MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chat-app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Middleware
app.use(cors());
app.use(express.json());

// Настройка статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/avatars', avatarRoutes);
//app.use('/api/voice', voiceMessageRoutes);



// Multer для загрузки аудиофайлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}${extension || '.wav'}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

app.post('/api/voice/upload', upload.single('audio'), (req, res) => {
    try {
        const audioUrl = `/uploads/audio/${req.file.filename}`;
        res.status(200).json({ audioUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading audio file', error });
    }
});

// Socket.io
const users = {};

io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    users[username] = socket.id;
    console.log(`User connected: ${username}`);

    io.emit('updateUserStatus', { username, status: 'online' });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.currentRoom = room;
        console.log(`User ${username} joined room: ${room}`);
    });

    socket.on('privateMessage', async ({ text, to, audioUrl, videoUrl }) => {
        let privateMessage = await Message.findOne({ users: { $all: [username, to] } });
        if (!privateMessage) {
            privateMessage = new Message({ users: [username, to], messages: [] });
        }

        privateMessage.messages.push({
            text,
            audioUrl,
            videoUrl,
            username,
            seen: false,
            timestamp: new Date()
        });

        await privateMessage.save();

        const targetSocketId = users[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('privateMessage', { text, audioUrl, videoUrl, from: username });
        }
    });

    socket.on('message', async (msg) => {
        let roomMessage = await Message.findOne({ room: msg.room });
        if (!roomMessage) {
            roomMessage = new Message({ room: msg.room, messages: [] });
        }

        roomMessage.messages.push({
            text: msg.text,
            username: msg.username,
            seen: false,
            timestamp: new Date()
        });

        await roomMessage.save();

        io.to(socket.currentRoom).emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`User ${username} disconnected`);
        delete users[username];
        io.emit('updateUserStatus', { username, status: 'offline' });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
