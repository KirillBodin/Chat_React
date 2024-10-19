import React, { useEffect, useState, useRef } from 'react'; // Імпортуємо React та хуки для управління станом і життєвим циклом / Importing React and hooks for state and lifecycle management
import { useParams } from 'react-router-dom'; // Імпортуємо useParams для отримання параметрів з URL / Importing useParams for extracting parameters from the URL
import axios from 'axios'; // Імпортуємо axios для роботи з API / Importing axios for API calls
import io from 'socket.io-client'; // Імпортуємо Socket.IO для реального часу / Importing Socket.IO for real-time communication
import { Picker } from 'emoji-mart'; // Імпортуємо Emoji Picker / Importing Emoji Picker
import 'emoji-mart/css/emoji-mart.css'; // Імпортуємо стилі для Emoji Picker / Importing styles for Emoji Picker
import MicIcon from '@mui/icons-material/Mic'; // Імпортуємо іконку мікрофона / Importing mic icon
import StopIcon from '@mui/icons-material/Stop'; // Імпортуємо іконку зупинки / Importing stop icon
import VideocamIcon from '@mui/icons-material/Videocam'; // Імпортуємо іконку відеокамери / Importing video camera icon
import StopCircleIcon from '@mui/icons-material/StopCircle'; // Імпортуємо іконку зупинки запису / Importing stop recording icon
import { Button, IconButton } from '@mui/material'; // Імпортуємо компоненти Material UI / Importing Material UI components
import { format } from 'date-fns'; // Імпортуємо функцію для форматування дати / Importing function for date formatting

function ChatRoom({ user, isDarkMode }) {
    const { roomName } = useParams(); // Отримуємо ім'я кімнати з URL / Extracting room name from URL parameters
    const [messages, setMessages] = useState([]); // Стан для повідомлень / State for messages
    const [message, setMessage] = useState(''); // Стан для нового повідомлення / State for new message
    const [showPicker, setShowPicker] = useState(false); // Стан для показу emoji picker / State to show emoji picker
    const [isRecordingAudio, setIsRecordingAudio] = useState(false); // Стан для запису аудіо / State for audio recording
    const [isRecordingVideo, setIsRecordingVideo] = useState(false); // Стан для запису відео / State for video recording
    const [isVideoWindowOpen, setIsVideoWindowOpen] = useState(false); // Стан для вікна запису відео / State for video recording window
    const videoRef = useRef(null); // Ref для відеоелемента / Ref for video element
    const player = useRef(null); // Ref для плеєра / Ref for player
    const socketRef = useRef(null); // Ref для Socket.IO з'єднання / Ref for Socket.IO connection

    useEffect(() => {
        // Отримуємо існуючі повідомлення кімнати з сервера / Fetch existing room messages from the server
        axios.get(`http://localhost:5000/api/message/${roomName}`)
            .then((response) => {
                setMessages(response.data); // Оновлюємо стан повідомлень / Update messages state
            })
            .catch((error) => {
                console.error('Error fetching room messages:', error); // Лог помилки / Log error
            });

        // Підключаємося до Socket.IO сервера / Connect to Socket.IO server
        socketRef.current = io('http://localhost:5000', { query: { username: user } });

        // Приєднуємось до кімнати / Join the room
        socketRef.current.emit('joinRoom', roomName);

        // Слухаємо нові повідомлення / Listen for new messages
        socketRef.current.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]); // Оновлюємо повідомлення / Update messages
        });

        return () => {
            socketRef.current.disconnect(); // Відключаємось при розмонтаженні компонента / Disconnect on component unmount
        };
    }, [roomName, user]); // Викликаємо ефект при зміні кімнати або користувача / Run effect when room or user changes

    const handleSendText = () => {
        if (message.trim()) {
            const newMessage = { text: message, username: user, room: roomName }; // Створюємо нове повідомлення / Create new message
            socketRef.current.emit('message', newMessage); // Відправляємо повідомлення через Socket.IO / Send message via Socket.IO
            setMessage(''); // Очищаємо поле вводу після відправки / Clear input after sending
        }
    };

    const addEmoji = (emoji) => {
        setMessage((prevMessage) => prevMessage + emoji.native); // Додаємо emoji до повідомлення / Add emoji to message
    };

    const startRecordingAudio = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const recorder = new MediaRecorder(stream); // Створюємо MediaRecorder для аудіо / Create MediaRecorder for audio
            recorder.start(); // Починаємо запис / Start recording
            setIsRecordingAudio(true); // Оновлюємо стан / Update state
        });
    };

    const stopRecordingAudio = () => {
        setIsRecordingAudio(false); // Зупиняємо запис аудіо / Stop audio recording
    };

    const startRecordingVideo = () => {
        setIsVideoWindowOpen(true); // Відкриваємо вікно для запису відео / Open video recording window
        setIsRecordingVideo(true); // Починаємо запис відео / Start video recording
    };

    const stopRecordingVideo = () => {
        if (player.current && player.current.record().isRecording()) {
            player.current.record().stop(); // Зупиняємо запис відео / Stop video recording
        }
    };

    const chatRoomContainerStyle = {
        backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff', // Встановлюємо фон залежно від теми / Set background based on theme
        color: isDarkMode ? '#ffffff' : '#000000', // Встановлюємо колір тексту залежно від теми / Set text color based on theme
    };

    return (
        <div className="private-messages-container" style={chatRoomContainerStyle}> {/* Контейнер для повідомлень / Container for messages */}
            <h2>Room: {roomName}</h2> {/* Відображаємо ім'я кімнати / Display room name */}
            <div className="messages"> {/* Контейнер для відображення повідомлень / Container for displaying messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === user ? 'user-message' : 'room-message'}`}> {/* Клас для стилізації повідомлень / Class for styling messages */}
                        <div className="message-content">
                            <strong>{msg.username}: </strong>
                            {msg.text && <span>{msg.text}</span>} {/* Відображаємо текст повідомлення / Display message text */}
                            {msg.audioUrl && <audio controls src={`http://localhost:5000${msg.audioUrl}`} />} {/* Відображаємо аудіо / Display audio */}
                            {msg.videoUrl && <video controls src={`http://localhost:5000${msg.videoUrl}`} width="300" />} {/* Відображаємо відео / Display video */}
                        </div>
                        <div className="timestamp">
                            {msg.timestamp && format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm')} {/* Відображаємо час повідомлення / Display message time */}
                        </div>
                    </div>
                ))}
            </div>

            <div className="input-container"> {/* Контейнер для введення повідомлень / Container for message input */}
                <input
                    type="text"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} // Оновлюємо стан при зміні тексту / Update state on text change
                />
                <Button variant="contained" color="primary" onClick={handleSendText}>Send</Button> {/* Кнопка для відправки текстового повідомлення / Button to send text message */}

                <IconButton onClick={() => setShowPicker(!showPicker)}> {/* Іконка для вибору emoji / Icon for emoji picker */}
                    😀
                </IconButton>
                {showPicker && (
                    <div className="emoji-picker">
                        <Picker onSelect={(emoji) => setMessage((prevMessage) => prevMessage + emoji.native)} /> {/* Вибираємо emoji і додаємо його до повідомлення / Pick emoji and add to message */}
                    </div>
                )}
            </div>

            {isVideoWindowOpen && (
                <div className="video-recording-window"> {/* Вікно для запису відео / Video recording window */}
                    <div data-vjs-player>
                        <video ref={videoRef} className="video-js vjs-default-skin" playsInline></video> {/* Елемент для відеозапису / Video element for recording */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatRoom; // Експортуємо компонент ChatRoom / Exporting ChatRoom component
