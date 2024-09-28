import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function PrivateChat({ user, recipient }) {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [privateMessages, setPrivateMessages] = useState([]); // Личные сообщения

    // Подключение к WebSocket при наличии пользователя
    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000', { query: { username: user } });
            setSocket(newSocket);

            // Обработка личных сообщений
            newSocket.on('privateMessage', (msg) => {
                console.log(`Received private message from ${msg.from}: ${msg.text}`);
                setPrivateMessages((prevMessages) => [...prevMessages, { text: msg.text, from: msg.from }]);
            });

            return () => {
                newSocket.off('privateMessage');
                newSocket.disconnect();
            };
        }
    }, [user]);

    // Загрузка личных сообщений при изменении получателя
    useEffect(() => {
        if (recipient) {
            const fetchPrivateMessages = async () => {
                console.log(`Loading private messages between ${user} and ${recipient}`);
                const response = await axios.get(`http://localhost:5000/api/messages/private/${user}/${recipient}`);
                const messages = Array.isArray(response.data) ? response.data : [];
                setPrivateMessages(messages); // Устанавливаем личные сообщения
                console.log(`Private messages with ${recipient}:`, messages);
            };

            fetchPrivateMessages();
        }
    }, [recipient, user]);

    const sendMessage = () => {
        if (message.trim() && socket) {
            console.log(`Sending private message to ${recipient}: ${message}`);
            socket.emit('privateMessage', { text: message, to: recipient });
            setPrivateMessages((prevMessages) => [...prevMessages, { text: message, from: user }]);
            setMessage(''); // Очищаем поле ввода
        }
    };

    return (
        <div className="private-chat">
            <h2>Chat with {recipient}</h2>
            <div className="messages">
                {privateMessages.length === 0 ? (
                    <p>No messages yet with {recipient}</p>
                ) : (
                    privateMessages.map((msg, index) => (
                        <div key={index}><strong>{msg.from || msg.username}: </strong>{msg.text}</div>
                    ))
                )}
            </div>
            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)} // Обновляем сообщение
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default PrivateChat;
