import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../css/ChatRoom.css';
import PrivateChat from './PrivateChat'; // Импортируем новый компонент для личных сообщений

function ChatRoom({ user }) {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Сообщения для комнат
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentRoom, setCurrentRoom] = useState('general');
    const [currentRecipient, setCurrentRecipient] = useState(null); // Получатель для личных сообщений

    // Подключение к WebSocket при наличии пользователя
    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000', { query: { username: user } });
            setSocket(newSocket);

            // Обработка сообщений в комнатах
            newSocket.on('message', (msg) => {
                console.log(`Received message from room: ${msg.room}, message: ${msg.text}`);
                setMessages((prevMessages) => [...prevMessages, msg]); // Добавляем сообщение в массив
            });

            return () => {
                newSocket.off('message');
                newSocket.disconnect();
            };
        }
    }, [user]);

    // Загрузка списка комнат и пользователей
    useEffect(() => {
        axios.get('http://localhost:5000/api/rooms')
            .then(response => setRooms(response.data));

        axios.get('http://localhost:5000/api/users')
            .then(response => {
                const filteredUsers = response.data.filter((usr) => usr.username !== user);
                setUsers(filteredUsers); // Исключаем самого пользователя
            });
    }, [user]);

    // Загрузка сообщений из комнаты
    useEffect(() => {
        const fetchRoomMessages = async () => {
            if (currentRoom) {
                console.log(`Loading messages from room ${currentRoom}...`);
                const response = await axios.get(`http://localhost:5000/api/messages/${currentRoom}`);
                const roomMessages = Array.isArray(response.data) ? response.data : [];
                setMessages(roomMessages); // Устанавливаем сообщения комнаты
                console.log(`Messages from room ${currentRoom}:`, roomMessages);
            }
        };

        fetchRoomMessages();

        if (currentRoom && socket) {
            console.log(`Joining room: ${currentRoom}`);
            socket.emit('joinRoom', currentRoom); // Присоединение к комнате
        }
    }, [currentRoom, socket]);

    const sendRoomMessage = () => {
        if (message.trim() && socket) {
            console.log(`Sending message to room ${currentRoom}: ${message}`);
            socket.emit('message', { text: message, username: user, room: currentRoom });
            setMessages((prevMessages) => [...prevMessages, { text: message, username: user, room: currentRoom }]);
            setMessage(''); // Очищаем поле ввода
        }
    };

    return (
        <div className="chat-room">
            <div className="sidebar">
                <h3>Users</h3>
                <ul>
                    {users.map((usr, index) => (
                        <li key={index} onClick={() => {
                            setCurrentRecipient(usr.username);  // Устанавливаем получателя личных сообщений
                            setCurrentRoom(null);  // Очищаем текущую комнату
                            console.log(`User ${usr.username} selected for private chat`);
                        }}>
                            {usr.username} {usr.username === currentRecipient ? "(selected)" : ""}
                        </li>
                    ))}
                </ul>
                <h3>Rooms</h3>
                <ul>
                    {rooms.map((room, index) => (
                        <li key={index} onClick={() => {
                            setCurrentRoom(room);  // Устанавливаем текущую комнату
                            setCurrentRecipient(null);  // Очищаем личного получателя
                            console.log(`Room ${room} selected`);
                        }}>
                            {room}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-window">
                {currentRecipient ? (
                    <PrivateChat user={user} recipient={currentRecipient} />
                ) : (
                    <>
                        <h2>Room: {currentRoom}</h2>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index}><strong>{msg.username}: </strong>{msg.text}</div>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)} // Обновляем сообщение
                        />
                        <button onClick={sendRoomMessage}>Send</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ChatRoom;
