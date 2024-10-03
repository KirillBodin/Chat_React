import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import '../css/PrivateMessages.css';

function PrivateMessages({ user }) {
    const { recipient } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [videoChunks, setVideoChunks] = useState([]);
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);

    // Получаем сообщения из базы данных
    useEffect(() => {
        axios.get(`http://localhost:5000/api/message/private/${user}/${recipient}`)
            .then((response) => {
                setMessages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching private messages:', error);
            });
    }, [user, recipient]);

    // Универсальная функция для отправки сообщения (текст, аудио или видео)
    const sendMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.post('http://localhost:5000/api/message/send', newMessage)
            .then(() => {
                console.log('Message sent successfully');
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
    };

    const handleSendText = () => {
        if (message.trim()) {
            const newMessage = { text: message, username: user, to: recipient };
            sendMessage(newMessage);
            setMessage('');
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
            recorder.ondataavailable = (e) => chunks.push(e.data);
            setAudioChunks(chunks);
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
                    const audioMessage = { audioUrl: res.data.audioUrl, to: recipient, username: user };
                    sendMessage(audioMessage);
                })
                .catch((error) => {
                    console.error('Error uploading audio:', error);
                });
        };
        setIsRecordingAudio(false);
    };

    const startRecordingVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecordingVideo(true);

            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            setVideoChunks(chunks);
        });
    };

    const stopRecordingVideo = () => {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
            const formData = new FormData();
            formData.append('video', videoBlob);

            axios.post('http://localhost:5000/api/video/upload', formData)
                .then((res) => {
                    const videoMessage = { videoUrl: res.data.videoUrl, to: recipient, username: user };
                    sendMessage(videoMessage);
                })
                .catch((error) => {
                    console.error('Error uploading video:', error);
                });
        };
        setIsRecordingVideo(false);
    };

    return (
        <div className="private-messages-container">
            <h2>Chat with {recipient}</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.username}: </strong>
                        {msg.text && <span>{msg.text}</span>}
                        {msg.audioUrl && <audio controls src={`http://localhost:5000${msg.audioUrl}`} />}
                        {msg.videoUrl && <video controls src={msg.videoUrl} width="300"></video>}
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
                <button onClick={handleSendText}>Send</button>

                <button onClick={() => setShowPicker(!showPicker)}>😀</button>
                {showPicker && (
                    <Picker onSelect={addEmoji} />
                )}

                {!isRecordingAudio ? (
                    <button onClick={startRecordingAudio}><MicIcon /> Start Voice</button>
                ) : (
                    <button onClick={stopRecordingAudio}><StopIcon /> Stop Voice</button>
                )}

                {!isRecordingVideo ? (
                    <button onClick={startRecordingVideo}><VideocamIcon /> Start Video</button>
                ) : (
                    <button onClick={stopRecordingVideo}><StopCircleIcon /> Stop Video</button>
                )}
            </div>
        </div>
    );
}

export default PrivateMessages;
