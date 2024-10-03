import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import '../css/ChatRoom.css'; // Подключаем стили

function ChatRoom({ user }) {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeUsersInRoom, setActiveUsersInRoom] = useState([]);
    const [avatars, setAvatars] = useState({});
    const [currentRoom, setCurrentRoom] = useState('general');
    const [privateMessages, setPrivateMessages] = useState([]);
    const [currentRecipient, setCurrentRecipient] = useState(null);
    const [typing, setTyping] = useState('');
    const [reactions, setReactions] = useState({});
    const [showPicker, setShowPicker] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    useEffect(() => {
        if (user) {
            // Подключаемся к сокету
            const newSocket = io('http://localhost:5000', { query: { username: user } });
            setSocket(newSocket);

            newSocket.on('message', (msg) => {
                setMessages((prevMessages) => [...prevMessages, msg]);
            });

            newSocket.on('privateMessage', (msg) => {
                setPrivateMessages((prevMessages) => [...prevMessages, { text: msg.text, from: msg.from }]);
            });

            newSocket.on('displayTyping', ({ from }) => {
                setTyping(`${from} is typing...`);
                setTimeout(() => setTyping(''), 2000);
            });

            newSocket.on('updateActiveUsers', (usersInRoom) => {
                setActiveUsersInRoom(usersInRoom);
            });

            return () => {
                newSocket.off('message');
                newSocket.off('privateMessage');
                newSocket.off('displayTyping');
                newSocket.off('updateActiveUsers');
                newSocket.disconnect();
            };
        }
    }, [user, currentRoom]);

    useEffect(() => {
        // Запрос для получения сообщений комнаты из базы данных
        axios.get(`http://localhost:5000/api/message/room/${currentRoom}`)
            .then((response) => {
                setMessages(response.data);  // Устанавливаем сообщения в состоянии
            })
            .catch((error) => {
                console.error('Error fetching room messages', error);
            });

        // Получаем пользователей
        axios.get('http://localhost:5000/api/users').then(response => {
            setUsers(response.data);
            const avatarsData = {};
            response.data.forEach(usr => {
                avatarsData[usr.username] = usr.avatarUrl || '';
            });
            setAvatars(avatarsData);
        });
    }, [currentRoom, user]);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();

            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            setAudioChunks(chunks);
        });
    };

    const stopRecording = () => {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            axios.post('http://localhost:5000/api/voice/upload', formData).then((res) => {
                socket.emit('message', { audioUrl: res.data.audioUrl, username: user, room: currentRoom });
                setMessages((prevMessages) => [...prevMessages, { audioUrl: res.data.audioUrl, username: user }]);
            });
        };
    };

    const handleReaction = (emoji, messageId) => {
        setReactions((prevReactions) => ({
            ...prevReactions,
            [messageId]: emoji.native
        }));
    };

    const sendMessage = () => {
        if (message.trim() && socket) {
            if (currentRecipient) {
                socket.emit('privateMessage', { text: message, to: currentRecipient });
                setPrivateMessages((prevMessages) => [...prevMessages, { text: message, from: user }]);
            } else {
                socket.emit('message', { text: message, username: user, room: currentRoom });
                setMessages((prevMessages) => [...prevMessages, { text: message, username: user }]);
            }
            setMessage('');
        }
    };

    return (
        <div className="chat-room-container">
            <div className="chat-window">
                <h2>{currentRecipient ? `Chat with ${currentRecipient}` : `Room: ${currentRoom}`}</h2>
                <div className="messages">
                    {currentRecipient
                        ? privateMessages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.from}: </strong>{msg.text}
                                <span>{reactions[msg._id]}</span>
                                <button onClick={() => setShowPicker(!showPicker)}>😀</button>
                                {showPicker && (
                                    <Picker onSelect={(emoji) => handleReaction(emoji, msg._id)} />
                                )}
                            </div>
                        ))
                        : messages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.username}: </strong>{msg.text || <audio controls src={msg.audioUrl}></audio>}
                                <span>{reactions[msg._id]}</span>
                                <button onClick={() => setShowPicker(!showPicker)}><EmojiEmotionsIcon /></button>
                                {showPicker && (
                                    <Picker onSelect={(emoji) => handleReaction(emoji, msg._id)} />
                                )}
                            </div>
                        ))}
                    <div className="typing-indicator">{typing}</div>
                </div>
                <input
                    type="text"
                    placeholder="Enter a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={() => socket.emit('typing', { to: currentRecipient, from: user })}
                />
                <button onClick={sendMessage}>Send</button>

                <div className="voice-controls">
                    <button onClick={startRecording}><MicIcon /> Start Recording</button>
                    <button onClick={stopRecording}><StopIcon /> Stop Recording</button>
                </div>

                <ToastContainer />
            </div>

            {/* Перемещаем Users in room направо */}
            <div className="sidebar-right">
                <h3>Users in {currentRoom}</h3>
                <ul>
                    {users
                        .filter((usr) => activeUsersInRoom.includes(usr.username))
                        .map((usr, index) => (
                            <li key={index}>
                                <img src={avatars[usr.username]} alt="avatar" className="avatar" />
                                <Link to={`/profile/${usr.username}`}>{usr.username}</Link>
                                {activeUsersInRoom.includes(usr.username) ? (
                                    <span style={{ color: 'green' }}> (Online in room)</span>
                                ) : (
                                    <span style={{ color: 'red' }}> (Offline)</span>
                                )}
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default ChatRoom;
