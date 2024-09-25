import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Подключаемся к серверу

function App() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('message', (msg) => {
            setChat([...chat, msg]); // Добавляем новое сообщение в чат
        });
        return () => socket.off('message');
    }, [chat]);

    const sendMessage = () => {
        socket.emit('message', message); // Отправляем сообщение
        setMessage(''); // Очищаем поле ввода
    };

    return (
        <div className="App">
        <h1>Chat</h1>
        <div>
        {chat.map((msg, index) => (
                <div key={index}>{msg}</div>
))}
</div>
    <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    />
    <button onClick={sendMessage}>Send</button>
        </div>
);
}

export default App;
