import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import ChatRoom from './components/ChatRoom';
import Profile from './components/Profile';
import RoomList from './components/RoomList';
import PrivateMessages from './components/PrivateMessages';
import Sidebar from './components/Sidebar';
import './css/App.css';
import NotificationSettings from "./components/NotificationSettings";
import AccountSettings from "./components/AccountSettings";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false); // Theme state
    const [sidebarWidth, setSidebarWidth] = useState(300); // Начальная ширина Sidebar

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const savedTheme = localStorage.getItem('theme'); // Check for saved theme

        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        }

        if (token && username) {
            setIsAuthenticated(true);
            setUser(username);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    // Логика для изменения ширины Sidebar в зависимости от ширины окна браузера
    useEffect(() => {
        const handleResize = () => {
            console.log(`Width: ${window.innerWidth}, Height: ${window.innerHeight}`);

            // Изменяем ширину Sidebar в зависимости от ширины окна
            if (window.innerWidth < 768) {
                setSidebarWidth(200); // Узкий Sidebar для маленьких экранов
            } else if (window.innerWidth < 1200) {
                setSidebarWidth(250); // Средний Sidebar
            } else {
                setSidebarWidth(300); // Стандартный Sidebar
            }
        };

        // Вызываем handleResize сразу после загрузки страницы
        handleResize();

        // Добавляем обработчик события resize
        window.addEventListener('resize', handleResize);

        // Очищаем обработчик при размонтировании компонента
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', newTheme); // Save theme preference
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                {isAuthenticated && (
                    <Sidebar
                        user={user}
                        toggleTheme={toggleTheme}
                        isDarkMode={isDarkMode}
                        sidebarWidth={sidebarWidth} // Передаем ширину Sidebar
                    />
                )}
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
                        <Route path="/chat/room/:roomName" element={isAuthenticated ? <ChatRoom user={user} /> : <Navigate to="/auth" />} />

                        <Route
                            path="/profile/:username"
                            element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/settings/notifications"
                            element={isAuthenticated ? <NotificationSettings user={user} /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/chat/private/:recipient"
                            element={isAuthenticated ? <PrivateMessages user={user} /> : <Navigate to="/auth" />}
                        />
                        <Route
                            path="/account-settings"
                            element={isAuthenticated ? <AccountSettings user={user} /> : <Navigate to="/auth" />}
                        />
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat/rooms" : "/auth"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
