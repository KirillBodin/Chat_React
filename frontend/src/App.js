import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import ChatRoom from './components/ChatRoom';
import Profile from './components/Profile';
import RoomList from './components/RoomList';
import PrivateMessages from './components/PrivateMessages';
import Sidebar from './components/Sidebar';
import './css/App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Статус загрузки

    useEffect(() => {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            console.log('Authenticated:', username);
            setIsAuthenticated(true);
            setUser(username);
        } else {
            console.log('Not authenticated');
            setIsAuthenticated(false); // Устанавливаем false, если токена нет
        }
        setIsLoading(false); // Устанавливаем загрузку как завершенную
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Пока идет проверка аутентификации, показываем спиннер
    }

    return (
        <Router>
            <div className="app-container">
                {isAuthenticated && <Sidebar user={user} />}
                <div className="content">
                    <Routes>
                        <Route
                            path="/auth"
                            element={!isAuthenticated ? (
                                <Auth setAuthenticated={setIsAuthenticated} setUser={setUser} />
                            ) : (
                                <Navigate to="/chat/rooms" />
                            )}
                        />
                        <Route
                            path="/chat/rooms"
                            element={isAuthenticated ? <RoomList /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/chat/room/:roomName"
                            element={isAuthenticated ? <ChatRoom user={user} /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/profile/:username"
                            element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/chat/private/:recipient"
                            element={isAuthenticated ? <PrivateMessages user={user} /> : <Navigate to="/auth" />}
                        />
                        {/* Если ни один маршрут не подходит, перенаправляем на основную страницу */}
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat/rooms" : "/auth"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
