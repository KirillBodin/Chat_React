import React, { useState } from 'react';
import axios from 'axios';
import '../css/Auth.css';

function Auth({ setAuthenticated, setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [usernameOrEmail, setUsernameOrEmail] = useState(''); // Поле для имени пользователя или email при логине
    const [email, setEmail] = useState(''); // Поле для email при регистрации
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async () => {
        const url = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin
            ? { usernameOrEmail, password } // Вход по имени пользователя или email
            : { username: usernameOrEmail, email, password }; // Регистрация с email

        try {
            const response = await axios.post(`http://localhost:5000${url}`, payload);

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

            {/* Поле для имени пользователя или email при логине */}
            <input
                type="text"
                placeholder={isLogin ? 'Username or Email' : 'Username'}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
            />

            {/* Поле для email при регистрации (видимо только при регистрации) */}
            {!isLogin && (
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            )}

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
