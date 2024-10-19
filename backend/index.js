const express = require('express'); // Підключаємо Express для створення сервера / Importing Express to create the server
const http = require('http'); // Підключаємо модуль HTTP для створення сервера / Importing HTTP module to create the server
const socketIO = require('socket.io'); // Підключаємо Socket.IO для реального часу / Importing Socket.IO for real-time functionality
const mongoose = require('mongoose'); // Підключаємо Mongoose для роботи з MongoDB / Importing Mongoose to work with MongoDB
const cors = require('cors'); // Підключаємо CORS для доступу з різних доменів / Importing CORS to allow cross-domain access
const path = require('path'); // Підключаємо Path для роботи з файлами / Importing Path to work with file paths
const multer = require('multer'); // Підключаємо Multer для завантаження файлів / Importing Multer for file uploads
const authRoutes = require('./routes/authRoutes'); // Імпортуємо маршрути авторизації / Importing auth routes
const userRoutes = require('./routes/userRoutes'); // Імпортуємо маршрути користувачів / Importing user routes
const roomRoutes = require('./routes/roomRoutes'); // Імпортуємо маршрути кімнат / Importing room routes
const messageRoutes = require('./routes/messageRoutes'); // Імпортуємо маршрути повідомлень / Importing message routes
const avatarRoutes = require('./routes/avatarRoutes'); // Імпортуємо маршрути аватарок / Importing avatar routes
const notificationRoutes = require('./routes/notificationRoutes'); // Імпортуємо маршрути для сповіщень / Importing notification routes
const accountSettingsRoutes = require('./routes/accountSettingsRoutes'); // Імпортуємо маршрути налаштувань акаунта / Importing account settings routes
const Message = require('./models/Message'); // Імпортуємо модель повідомлень / Importing Message model

const app = express(); // Створюємо екземпляр додатку Express / Creating an Express app instance
const server = http.createServer(app); // Створюємо HTTP сервер / Creating an HTTP server
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000', // Дозволяємо запити з фронтенда / Allowing requests from frontend
        methods: ['GET', 'POST'], // Дозволені методи HTTP / Allowed HTTP methods
        credentials: true // Вмикаємо обробку облікових даних / Enabling credentials
    }
});

// Підключення до MongoDB / Connecting to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chat-app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB')) // Лог при успішному з'єднанні / Log upon successful connection
    .catch((error) => console.error('MongoDB connection error:', error)); // Лог при помилці з'єднання / Log upon connection error

// Middleware
app.use(cors()); // Додаємо CORS для підтримки крос-доменних запитів / Adding CORS for cross-domain requests
app.use(express.json()); // Додаємо парсер JSON для запитів / Adding JSON parser for requests

// Налаштування статичних файлів / Setting up static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Вказуємо папку для статичних файлів / Point to folder for static files

// Routes
app.use('/auth', authRoutes); // Використовуємо маршрути авторизації / Using auth routes
app.use('/api/users', userRoutes); // Використовуємо маршрути користувачів / Using user routes
app.use('/api/room', roomRoutes); // Використовуємо маршрути кімнат / Using room routes
app.use('/api/message', messageRoutes); // Використовуємо маршрути повідомлень / Using message routes
app.use('/api/avatars', avatarRoutes); // Використовуємо маршрути аватарок / Using avatar routes
app.use('/api/notifications', notificationRoutes); // Використовуємо маршрути сповіщень / Using notification routes
app.use('/api/account-settings', accountSettingsRoutes); // Використовуємо маршрути налаштувань акаунта / Using account settings routes

// Multer для завантаження аудіофайлів / Multer for uploading audio files
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio'); // Директорія для збереження аудіо / Directory for saving audio files
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname); // Отримуємо розширення файлу / Get file extension
        const filename = `${Date.now()}${extension || '.wav'}`; // Генеруємо ім'я файлу / Generate file name
        cb(null, filename);
    }
});
const uploadAudio = multer({ storage: audioStorage }); // Налаштовуємо Multer для збереження аудіо / Configure Multer to store audio

// Маршрут для завантаження аудіофайлів / Route for uploading audio files
app.post('/api/voice/upload', uploadAudio.single('audio'), (req, res) => {
    try {
        const audioUrl = `/uploads/audio/${req.file.filename}`; // Формуємо URL до файлу / Generate file URL
        res.status(200).json({ audioUrl }); // Повертаємо успішну відповідь / Return success response
    } catch (error) {
        res.status(500).json({ message: 'Error uploading audio file', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Multer для завантаження відеофайлів / Multer for uploading video files
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/video'); // Директорія для збереження відео / Directory for saving video files
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname); // Отримуємо розширення файлу / Get file extension
        const filename = `${Date.now()}${extension || '.mp4'}`; // Ім'я файлу, збережене за замовчуванням у форматі mp4 / Filename saved as mp4 by default
        cb(null, filename);
    }
});
const uploadVideo = multer({ storage: videoStorage }); // Налаштовуємо Multer для збереження відео / Configure Multer to store video

// Маршрут для завантаження відеофайлів / Route for uploading video files
app.post('/api/video/upload', uploadVideo.single('video'), (req, res) => {
    try {
        const videoUrl = `/uploads/video/${req.file.filename}`; // Формуємо URL до файлу / Generate file URL
        res.status(200).json({ videoUrl }); // Повертаємо успішну відповідь / Return success response
    } catch (error) {
        res.status(500).json({ message: 'Error uploading video file', error }); // Повертаємо помилку сервера / Return server error
    }
});

// Socket.io
const users = {}; // Об'єкт для відстеження користувачів / Object to track users

io.on('connection', (socket) => {
    const username = socket.handshake.query.username; // Отримуємо ім'я користувача з socket запиту / Get username from socket query
    users[username] = socket.id; // Зберігаємо ID сокету користувача / Store user's socket ID
    console.log(`User connected: ${username}`); // Лог при з'єднанні користувача / Log upon user connection

    io.emit('updateUserStatus', { username, status: 'online' }); // Оновлюємо статус користувача / Update user's status

    socket.on('joinRoom', (room) => {
        socket.join(room); // Користувач приєднується до кімнати / User joins a room
        socket.currentRoom = room; // Встановлюємо поточну кімнату користувача / Set user's current room
        console.log(`User ${username} joined room: ${room}`); // Лог приєднання до кімнати / Log upon joining room
    });

    socket.on('privateMessage', async ({ text, to, audioUrl, videoUrl }) => {
        let privateMessage = await Message.findOne({ users: { $all: [username, to] } }); // Знаходимо або створюємо повідомлення / Find or create message
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

        await privateMessage.save(); // Зберігаємо повідомлення / Save message

        const targetSocketId = users[to]; // Отримуємо ID сокету отримувача / Get recipient's socket ID
        if (targetSocketId) {
            io.to(targetSocketId).emit('privateMessage', { text, audioUrl, videoUrl, from: username }); // Відправляємо повідомлення / Send message
        }
    });

    // Socket.io: обробка повідомлень в кімнаті / Socket.io: handling messages in the room
    socket.on('message', async (msg) => {
        try {
            let roomMessage = await Message.findOne({ room: msg.room }); // Знаходимо повідомлення для кімнати / Find room message

            if (!roomMessage) {
                roomMessage = new Message({ room: msg.room, messages: [] }); // Створюємо нове повідомлення для кімнати / Create new room message
            }

            const newMessage = {
                text: msg.text || "", // Текст може бути порожнім / Text can be empty
                audioUrl: msg.audioUrl || null, // Аудіо може бути порожнім / Audio can be empty
                videoUrl: msg.videoUrl || null, // Відео може бути порожнім / Video can be empty
                username: msg.username,
                seen: false,
                timestamp: new Date()
            };

            roomMessage.messages.push(newMessage); // Додаємо нове повідомлення в кімнату / Add new message to the room

            await roomMessage.save(); // Зберігаємо повідомлення / Save message

            io.to(socket.currentRoom).emit('message', newMessage); // Відправляємо повідомлення через Socket.io / Send message via Socket.io

        } catch (error) {
            console.error('Error saving message:', error); // Лог при помилці збереження / Log upon save error
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${username} disconnected`); // Лог при відключенні користувача / Log upon user disconnect
        delete users[username]; // Видаляємо користувача з об'єкта / Remove user from users object
        io.emit('updateUserStatus', { username, status: 'offline' }); // Оновлюємо статус користувача / Update user's status
    });
});

const PORT = process.env.PORT || 5000; // Встановлюємо порт сервера / Set server port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Запускаємо сервер / Start the server
