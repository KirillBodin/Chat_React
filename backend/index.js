const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Обработчик для WebSocket соединения
io.on('connection', (socket) => {
    console.log('New client connected');

    // Обработка получения и отправки сообщений
    socket.on('message', (msg) => {
        io.emit('message', msg); // Отправляем сообщение всем пользователям
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
