import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function Chat({ username, room }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Присоединяемся к комнате
        socket.emit('joinRoom', room);

        // Проверяем состояние соединения
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        // Загружаем историю сообщений
        axios.get(`http://localhost:5000/api/messages/${room}`)
            .then((response) => {
                setMessages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching messages:', error);
            });

        // Обрабатываем получение сообщений
        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [room]);


    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('message', { text: message, room, username });
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Room: {room}</h2>
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.username}: </strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
