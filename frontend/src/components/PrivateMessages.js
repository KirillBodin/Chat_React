import React, { useEffect, useState, useRef } from 'react'; // Імпортуємо React і хуки для управління станом та ефектами / Importing React and hooks for state and effects management
import { useParams } from 'react-router-dom'; // Імпортуємо useParams для отримання параметрів з URL / Importing useParams for extracting parameters from the URL
import axios from 'axios'; // Імпортуємо axios для роботи з API / Importing axios for API calls
import { Picker } from 'emoji-mart'; // Імпортуємо Emoji Picker / Importing Emoji Picker
import 'emoji-mart/css/emoji-mart.css'; // Імпортуємо стилі для Emoji Picker / Importing styles for Emoji Picker
import MicIcon from '@mui/icons-material/Mic'; // Імпортуємо іконку мікрофона / Importing mic icon
import StopIcon from '@mui/icons-material/Stop'; // Імпортуємо іконку зупинки / Importing stop icon
import VideocamIcon from '@mui/icons-material/Videocam'; // Імпортуємо іконку відеокамери / Importing video camera icon
import StopCircleIcon from '@mui/icons-material/StopCircle'; // Імпортуємо іконку зупинки запису / Importing stop recording icon
import { Button, IconButton } from '@mui/material'; // Імпортуємо компоненти Material UI / Importing Material UI components
import videojs from 'video.js'; // Імпортуємо Video.js для відео плеєра / Importing Video.js for video player
import 'video.js/dist/video-js.css'; // Імпортуємо стилі Video.js / Importing Video.js styles
import 'videojs-record/dist/videojs.record.js'; // Імпортуємо плагін Video.js Record для запису відео / Importing Video.js Record plugin for video recording
import 'videojs-record/dist/css/videojs.record.css'; // Імпортуємо стилі для Video.js Record / Importing Video.js Record styles
import 'webrtc-adapter'; // Імпортуємо адаптер WebRTC для запису / Importing WebRTC adapter for recording
import { format } from 'date-fns'; // Імпортуємо функцію для форматування дати / Importing function for date formatting

function PrivateMessages({ user, isDarkMode }) {
    const { recipient } = useParams(); // Отримуємо отримувача з URL параметрів / Extract recipient from URL parameters
    const [messages, setMessages] = useState([]); // Стан для повідомлень / State for messages
    const [message, setMessage] = useState(''); // Стан для введеного повідомлення / State for the input message
    const [showPicker, setShowPicker] = useState(false); // Стан для показу Emoji Picker / State to show Emoji Picker
    const [isRecordingAudio, setIsRecordingAudio] = useState(false); // Стан для запису аудіо / State for audio recording
    const [isRecordingVideo, setIsRecordingVideo] = useState(false); // Стан для запису відео / State for video recording
    const [isVideoWindowOpen, setIsVideoWindowOpen] = useState(false); // Стан для вікна запису відео / State for video recording window
    const videoRef = useRef(null); // Ref для відео елемента / Ref for video element
    const player = useRef(null); // Ref для відео плеєра / Ref for video player

    // Завантаження приватних повідомлень між користувачами / Fetching private messages between users
    useEffect(() => {
        axios.get(`http://localhost:5000/api/message/private/${user}/${recipient}`)
            .then((response) => {
                setMessages(response.data); // Оновлюємо стан повідомлень / Update messages state
            })
            .catch((error) => {
                console.error('Error fetching private messages:', error); // Лог помилки / Log error
            });
    }, [user, recipient]); // Виконуємо запит при зміні користувача або отримувача / Run request when user or recipient changes

    // Налаштування плеєра для запису відео / Setting up the player for video recording
    useEffect(() => {
        if (isRecordingVideo && videoRef.current) {
            player.current = videojs(videoRef.current, {
                controls: true, // Включаємо управління плеєром / Enable player controls
                width: 640, // Встановлюємо ширину відео / Set video width
                height: 480, // Встановлюємо висоту відео / Set video height
                plugins: {
                    record: {
                        audio: true, // Дозволяємо запис аудіо / Allow audio recording
                        video: true, // Дозволяємо запис відео / Allow video recording
                        maxLength: 600, // Максимальна довжина відео 600 секунд / Max video length 600 seconds
                        debug: true, // Включаємо налагодження / Enable debugging
                        videoMimeType: 'video/webm;codecs=vp8,opus', // Тип відео / Video type
                        audioMimeType: 'audio/webm;codecs=opus' // Тип аудіо / Audio type
                    }
                }
            });

            // Обробка завершення запису / Handling the end of the recording
            player.current.on('finishRecord', () => {
                const recordedData = player.current.recordedData; // Отримуємо записане відео / Get recorded video data
                const formData = new FormData();
                formData.append('video', recordedData, 'recorded-video.webm'); // Додаємо відео до форми / Add video to form data

                axios.post('http://localhost:5000/api/video/upload', formData) // Відправляємо відео на сервер / Send video to server
                    .then((res) => {
                        const videoMessage = { videoUrl: res.data.videoUrl, to: recipient, username: user }; // Створюємо повідомлення з відео / Create video message
                        setMessages((prevMessages) => [...prevMessages, videoMessage]); // Оновлюємо повідомлення / Update messages
                    })
                    .catch((error) => {
                        console.error('Error uploading video:', error); // Логування помилки завантаження / Log video upload error
                    });

                // Очищуємо плеєр після запису / Clean up the player after recording
                if (player.current) {
                    player.current.dispose();
                    player.current = null;
                }
                setIsRecordingVideo(false);
                setIsVideoWindowOpen(false);
            });

            // Очищення плеєра при демонтажі компонента / Clean up the player when the component unmounts
            return () => {
                if (player.current) {
                    player.current.dispose();
                    player.current = null;
                }
            };
        }
    }, [isRecordingVideo, recipient, user]); // Викликаємо ефект при зміні стану запису відео, отримувача або користувача / Run effect when video recording state, recipient, or user changes

    // Функція для відправки повідомлення / Function to send a message
    const sendMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]); // Оновлюємо повідомлення / Update messages
        axios.post('http://localhost:5000/api/message/send', newMessage) // Відправляємо повідомлення на сервер / Send message to server
            .then(() => {
                console.log('Message sent successfully'); // Лог при успішній відправці / Log success
            })
            .catch((error) => {
                console.error('Error sending message:', error); // Логування помилки відправки / Log error in sending
            });
    };

    // Обробка відправки текстового повідомлення / Handle sending text message
    const handleSendText = () => {
        if (message.trim()) {
            const newMessage = { text: message, username: user, to: recipient }; // Створюємо нове повідомлення / Create new message
            sendMessage(newMessage); // Відправляємо повідомлення / Send message
            setMessage(''); // Очищаємо поле вводу / Clear input field
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

    const privateMessagesContainerStyle = {
        backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff', // Змінюємо фон залежно від теми / Change background based on theme
        color: isDarkMode ? '#ffffff' : '#000000', // Змінюємо колір тексту залежно від теми / Change text color based on theme
    };

    return (
        <div className="private-messages-container" style={privateMessagesContainerStyle}> {/* Контейнер для приватних повідомлень / Container for private messages */}
            <h2>Chat with {recipient}</h2> {/* Відображаємо ім'я отримувача / Display recipient name */}
            <div className="messages"> {/* Контейнер для відображення повідомлень / Container for displaying messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === user ? 'user-message' : 'recipient-message'}`}> {/* Клас для стилізації повідомлень / Class for styling messages */}
                        <div className="message-content">
                            <strong>{msg.username}: </strong> {/* Відображаємо ім'я користувача / Display username */}
                            {msg.text && <span>{msg.text}</span>} {/* Відображаємо текст повідомлення / Display message text */}
                        </div>
                        <div className="timestamp">
                            {msg.timestamp && format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm')} {/* Відображаємо час повідомлення / Display message timestamp */}
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
                <Button variant="contained" color="primary" onClick={handleSendText}>Send</Button> {/* Кнопка для відправки повідомлення / Button to send message */}
            </div>
        </div>
    );
}

export default PrivateMessages; // Експортуємо компонент PrivateMessages / Export PrivateMessages component
