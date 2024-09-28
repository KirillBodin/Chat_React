import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ChatRoom from './components/ChatRoom';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState('');

    useEffect(() => {
        // Проверяем наличие токена в localStorage
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username'); // Сохраняем имя пользователя в localStorage

        if (token && username) {
            setIsAuthenticated(true);
            setUser(username); // Устанавливаем имя пользователя
        }
    }, []);

    return (
        <div>
            {isAuthenticated ? (
                <ChatRoom user={user} />
            ) : (
                <Auth setAuthenticated={setIsAuthenticated} setUser={setUser} />
            )}
        </div>
    );
}


export default App;
