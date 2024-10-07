import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { Button, IconButton } from '@mui/material';

function ChatRoom({ user }) {
    const { roomName } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [videoChunks, setVideoChunks] = useState([]);
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);
    const [isVideoWindowOpen, setIsVideoWindowOpen] = useState(false);
    const videoRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Fetch existing room messages from the server
        axios.get(`http://localhost:5000/api/message/${roomName}`)
            .then((response) => {
                setMessages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching room messages:', error);
            });

        // Connect to Socket.io server
        socketRef.current = io('http://localhost:5000', { query: { username: user } });

        // Join the room
        socketRef.current.emit('joinRoom', roomName);

        // Listen for new messages
        socketRef.current.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomName, user]);

    const handleSendText = () => {
        if (message.trim()) {
            const newMessage = { text: message, username: user, room: roomName };
            socketRef.current.emit('message', newMessage);
            setMessage(''); // Clear input after sending
        }
    };

    const addEmoji = (emoji) => {
        setMessage((prevMessage) => prevMessage + emoji.native);
    };

    const startRecordingAudio = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecordingAudio(true);

            const chunks = [];
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            setAudioChunks(chunks);
        });
    };



    const startRecordingVideo = () => {
        setIsVideoWindowOpen(true);
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const videoElement = videoRef.current;
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }

            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecordingVideo(true);

            const chunks = [];
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            setVideoChunks(chunks);
        });
    };

    const stopRecordingAudio = () => {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            axios.post('http://localhost:5000/api/voice/upload', formData)
                .then((res) => {
                    const audioMessage = {
                        audioUrl: res.data.audioUrl, // Ссылка на загруженный аудиофайл
                        room: roomName,
                        username: user,
                        text: "", // Аудиосообщение не содержит текста
                    };
                    socketRef.current.emit('message', audioMessage); // Отправляем аудиосообщение
                })
                .catch((error) => {
                    console.error('Error uploading audio:', error);
                });
        };
        setIsRecordingAudio(false);
    };


    const stopRecordingVideo = () => {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
            const formData = new FormData();
            formData.append('video', videoBlob);

            axios.post('http://localhost:5000/api/video/upload', formData)
                .then((res) => {
                    const videoMessage = {
                        videoUrl: res.data.videoUrl, // Ссылка на загруженный видеофайл
                        room: roomName,
                        username: user,
                        text: "", // Видеосообщение не содержит текста
                    };
                    socketRef.current.emit('message', videoMessage); // Отправляем видеосообщение
                })
                .catch((error) => {
                    console.error('Error uploading video:', error);
                });
        };
        setIsRecordingVideo(false);
        setIsVideoWindowOpen(false);
    };



    return (
        <div className="chat-room-container">
            <h2>Room: {roomName}</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === user ? 'user-message' : 'room-message'}`}>
                        <strong>{msg.username}: </strong>
                        {msg.text && <span>{msg.text}</span>}
                        {msg.audioUrl && <audio controls src={`http://localhost:5000${msg.audioUrl}`} />}
                        {msg.videoUrl && <video controls src={`http://localhost:5000${msg.videoUrl}`} width="300" />}
                    </div>
                ))}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSendText}>Send</Button>

                <IconButton onClick={() => setShowPicker(!showPicker)}>
                    😀
                </IconButton>
                {showPicker && (
                    <div className="emoji-picker">
                        <Picker onSelect={addEmoji} />
                    </div>
                )}

                {!isRecordingAudio ? (
                    <IconButton onClick={startRecordingAudio} color="primary">
                        <MicIcon />
                    </IconButton>
                ) : (
                    <IconButton onClick={stopRecordingAudio} color="secondary">
                        <StopIcon />
                    </IconButton>
                )}

                {!isRecordingVideo ? (
                    <IconButton onClick={startRecordingVideo} color="primary">
                        <VideocamIcon />
                    </IconButton>
                ) : (
                    <IconButton onClick={stopRecordingVideo} color="secondary">
                        <StopCircleIcon />
                    </IconButton>
                )}
            </div>

            {isVideoWindowOpen && (
                <div className="video-recording-window">
                    <video ref={videoRef} width="300" height="200"></video>
                    <Button variant="contained" color="secondary" onClick={stopRecordingVideo}>Stop Recording</Button>
                </div>
            )}
        </div>
    );
}

export default ChatRoom;
