import React, { useState, useEffect } from 'react'; // Імпортуємо React і хуки для управління станом та ефектами / Import React and hooks for state and effects management
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Імпортуємо компоненти для маршрутизації / Import routing components
import Auth from './components/Auth'; // Імпортуємо компонент Auth для аутентифікації / Import Auth component for authentication
import ChatRoom from './components/ChatRoom'; // Імпортуємо компонент ChatRoom для чату / Import ChatRoom component for chat
import Profile from './components/Profile'; // Імпортуємо компонент Profile для профілю / Import Profile component
import RoomList from './components/RoomList'; // Імпортуємо компонент RoomList для списку кімнат / Import RoomList component for room list
import PrivateMessages from './components/PrivateMessages'; // Імпортуємо компонент PrivateMessages для приватних повідомлень / Import PrivateMessages component for private messages
import Sidebar from './components/Sidebar'; // Імпортуємо компонент Sidebar для бічної панелі / Import Sidebar component for sidebar
import './css/App.css'; // Імпортуємо CSS для застосування / Import CSS for application styling
import NotificationSettings from "./components/NotificationSettings"; // Імпортуємо компонент для налаштувань сповіщень / Import NotificationSettings component
import AccountSettings from "./components/AccountSettings"; // Імпортуємо компонент для налаштувань аккаунта / Import AccountSettings component

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Стан для аутентифікації / State for authentication
    const [user, setUser] = useState(''); // Стан для користувача / State for user
    const [isLoading, setIsLoading] = useState(true); // Стан для індикатора завантаження / State for loading indicator
    const [isDarkMode, setIsDarkMode] = useState(false); // Стан для теми (світла або темна) / State for theme (light or dark)
    const [sidebarWidth, setSidebarWidth] = useState(300); // Початкова ширина Sidebar / Initial Sidebar width

    useEffect(() => {
        const token = localStorage.getItem('token'); // Отримуємо токен із localStorage / Get token from localStorage
        const username = localStorage.getItem('username'); // Отримуємо ім'я користувача / Get username
        const savedTheme = localStorage.getItem('theme'); // Перевіряємо збережену тему / Check for saved theme

        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark'); // Встановлюємо тему, якщо збережена / Set theme if saved
        }

        if (token && username) {
            setIsAuthenticated(true); // Встановлюємо стан аутентифікації / Set authenticated state
            setUser(username); // Встановлюємо ім'я користувача / Set user name
        } else {
            setIsAuthenticated(false); // Якщо токен відсутній, скидаємо стан аутентифікації / If no token, reset authenticated state
        }
        setIsLoading(false); // Вимикаємо індикатор завантаження / Turn off loading indicator
    }, []);

    // Логіка для зміни ширини Sidebar в залежності від розміру вікна / Logic for adjusting Sidebar width based on window size
    useEffect(() => {
        const handleResize = () => {
            console.log(`Width: ${window.innerWidth}, Height: ${window.innerHeight}`);

            if (window.innerWidth < 768) {
                setSidebarWidth(200); // Вузький Sidebar для маленьких екранів / Narrow Sidebar for small screens
            } else if (window.innerWidth < 1200) {
                setSidebarWidth(250); // Середній Sidebar для середніх екранів / Medium Sidebar for medium screens
            } else {
                setSidebarWidth(300); // Стандартний Sidebar для великих екранів / Standard Sidebar for large screens
            }
        };

        handleResize(); // Викликаємо функцію після завантаження сторінки / Call the function after page load

        window.addEventListener('resize', handleResize); // Додаємо обробник події resize / Add resize event listener

        return () => {
            window.removeEventListener('resize', handleResize); // Очищаємо обробник події при демонтажі компонента / Clean up event listener on component unmount
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light'; // Перемикання теми між світлою і темною / Toggle between light and dark themes
        setIsDarkMode(!isDarkMode); // Зміна стану теми / Update theme state
        localStorage.setItem('theme', newTheme); // Збереження обраної теми в localStorage / Save selected theme in localStorage
    };

    if (isLoading) { // Показуємо індикатор завантаження, якщо дані ще завантажуються / Show loading indicator if data is still loading
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}> {/* Застосування теми до контейнера додатку / Apply theme to app container */}
                {isAuthenticated && (
                    <Sidebar
                        user={user} // Передаємо користувача в Sidebar / Pass user to Sidebar
                        toggleTheme={toggleTheme} // Функція для перемикання теми / Function to toggle theme
                        isDarkMode={isDarkMode} // Передаємо стан теми / Pass theme state
                        sidebarWidth={sidebarWidth} // Передаємо ширину Sidebar / Pass Sidebar width
                    />
                )}
                <div className="content">
                    <Routes>
                        {/* Маршрут для аутентифікації / Route for authentication */}
                        <Route
                            path="/auth"
                            element={!isAuthenticated ? (
                                <Auth setAuthenticated={setIsAuthenticated} setUser={setUser} /> // Якщо не аутентифікований, показуємо компонент Auth / If not authenticated, show Auth component
                            ) : (
                                <Navigate to="/chat/rooms" /> // Якщо аутентифікований, перенаправляємо до кімнат / If authenticated, redirect to rooms
                            )}
                        />
                        {/* Маршрут для списку кімнат / Route for room list */}
                        <Route
                            path="/chat/rooms"
                            element={isAuthenticated ? <RoomList /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо список кімнат, інакше перенаправляємо до аутентифікації / If authenticated, show room list, otherwise redirect to auth
                        />
                        {/* Передаємо пропс isDarkMode у ChatRoom / Pass isDarkMode prop to ChatRoom */}
                        <Route
                            path="/chat/room/:roomName"
                            element={isAuthenticated ? <ChatRoom user={user} isDarkMode={isDarkMode} /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо чат-кімнату, інакше перенаправляємо до аутентифікації / If authenticated, show chat room, otherwise redirect to auth
                        />
                        {/* Маршрут для профілю користувача / Route for user profile */}
                        <Route
                            path="/profile/:username"
                            element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо профіль, інакше перенаправляємо до аутентифікації / If authenticated, show profile, otherwise redirect to auth
                        />
                        {/* Маршрут для налаштувань сповіщень / Route for notification settings */}
                        <Route
                            path="/settings/notifications"
                            element={isAuthenticated ? <NotificationSettings user={user} /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо налаштування сповіщень, інакше перенаправляємо до аутентифікації / If authenticated, show notification settings, otherwise redirect to auth
                        />
                        {/* Передаємо пропс isDarkMode у PrivateMessages / Pass isDarkMode prop to PrivateMessages */}
                        <Route
                            path="/chat/private/:recipient"
                            element={isAuthenticated ? <PrivateMessages user={user} isDarkMode={isDarkMode} /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо приватні повідомлення, інакше перенаправляємо до аутентифікації / If authenticated, show private messages, otherwise redirect to auth
                        />
                        {/* Маршрут для налаштувань аккаунта / Route for account settings */}
                        <Route
                            path="/account-settings"
                            element={isAuthenticated ? <AccountSettings user={user} /> : <Navigate to="/auth" />} // Якщо аутентифікований, показуємо налаштування аккаунта, інакше перенаправляємо до аутентифікації / If authenticated, show account settings, otherwise redirect to auth
                        />
                        {/* Перенаправлення для невідомих маршрутів / Redirect for unknown routes */}
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat/rooms" : "/auth"} />} /> {/* Перенаправляємо на список кімнат або аутентифікацію залежно від стану аутентифікації / Redirect to room list or auth based on authentication state */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App; // Експортуємо компонент App / Export App component
