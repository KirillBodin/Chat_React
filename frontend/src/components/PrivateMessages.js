import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { Button, IconButton } from '@mui/material';

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
    const [isVideoWindowOpen, setIsVideoWindowOpen] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/message/private/${user}/${recipient}`)
            .then((response) => {
                setMessages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching private messages:', error);
            });
    }, [user, recipient]);

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
        setIsVideoWindowOpen(false);
    };

    return (
        <div className="private-messages-container">
            <h2>Chat with {recipient}</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === user ? 'user-message' : 'recipient-message'}`}>
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

export default PrivateMessages;
