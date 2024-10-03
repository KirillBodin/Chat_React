import React, { useState } from 'react';
import axios from 'axios';
import '../css/Auth.css';

function Auth({ setAuthenticated, setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async () => {
        const url = isLogin ? '/auth/login' : '/auth/register';
        try {
            const response = await axios.post('http://localhost:5000/auth/login', { username, password });

            // Логируем ответ от сервера
            console.log('Response data:', response.data);

            // Извлекаем токен и имя пользователя напрямую из ответа
            const token = response.data.token;
            const userNameFromResponse = response.data.username; // Переименуем, чтобы не конфликтовать с состоянием

            if (!token || !userNameFromResponse) {
                throw new Error('Invalid response structure');
            }

            // Сохраняем токен и имя пользователя в localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('username', userNameFromResponse);

            // Обновляем состояние аутентификации в приложении
            setAuthenticated(true);
            setUser(userNameFromResponse);

        } catch (error) {
            console.error(error);  // Логируем ошибку для проверки
            setError('Authentication failed. Please try again.');
        }
    };



    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            {error && <p className="error">{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuth}>{isLogin ? 'Login' : 'Register'}</button>
            <p onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
            </p>
        </div>
    );
}

export default Auth;
