import React, { useState } from 'react'; // Імпортуємо React та useState для керування станом / Import React and useState for state management
import axios from 'axios'; // Імпортуємо axios для запитів до сервера / Import axios for server requests
import '../css/Auth.css'; // Імпортуємо CSS для стилізації компоненту / Import CSS for component styling

function Auth({ setAuthenticated, setUser }) {
    const [isLogin, setIsLogin] = useState(true); // Стан для перемикання між логіном і реєстрацією / State for toggling between login and registration
    const [usernameOrEmail, setUsernameOrEmail] = useState(''); // Поле для імені користувача або email при логіні / Field for username or email during login
    const [email, setEmail] = useState(''); // Поле для email при реєстрації / Field for email during registration
    const [password, setPassword] = useState(''); // Поле для паролю / Field for password
    const [error, setError] = useState(''); // Стан для відображення помилок / State for displaying errors

    // Функція обробки аутентифікації / Function to handle authentication
    const handleAuth = async () => {
        const url = isLogin ? '/auth/login' : '/auth/register'; // Визначаємо URL залежно від режиму (логін чи реєстрація) / Define URL based on mode (login or register)
        const payload = isLogin
            ? { usernameOrEmail, password } // Дані для логіну / Data for login
            : { username: usernameOrEmail, email, password }; // Дані для реєстрації / Data for registration

        try {
            const response = await axios.post(`http://localhost:5000${url}`, payload); // Відправляємо запит на сервер / Send request to the server

            // Логування відповіді сервера / Log the server response
            console.log('Response data:', response.data);

            // Отримуємо токен і ім'я користувача з відповіді / Extract token and username from response
            const token = response.data.token;
            const userNameFromResponse = response.data.username; // Переіменовуємо, щоб не конфліктувати зі станом / Rename to avoid conflict with state

            if (!token || !userNameFromResponse) {
                throw new Error('Invalid response structure'); // Перевірка на правильну структуру відповіді / Validate response structure
            }

            // Зберігаємо токен і ім'я користувача в localStorage / Save token and username in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('username', userNameFromResponse);

            // Оновлюємо стан аутентифікації в додатку / Update authentication state in the app
            setAuthenticated(true);
            setUser(userNameFromResponse);

        } catch (error) {
            console.error(error);  // Логування помилки для діагностики / Log error for debugging
            setError('Authentication failed. Please try again.'); // Відображаємо повідомлення про помилку / Display error message
        }
    };

    return (
        <div className="auth-container"> {/* Контейнер для форми аутентифікації / Container for the authentication form */}
            <h2>{isLogin ? 'Login' : 'Register'}</h2> {/* Заголовок залежно від режиму / Heading based on the mode */}
            {error && <p className="error">{error}</p>} {/* Відображення помилки / Display error if any */}

            {/* Поле для імені користувача або email при логіні / Field for username or email during login */}
            <input
                type="text"
                placeholder={isLogin ? 'Username or Email' : 'Username'} // Placeholder змінюється залежно від режиму / Placeholder changes based on the mode
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)} // Оновлення стану при введенні / Update state on input
            />

            {/* Поле для email при реєстрації, видиме тільки при реєстрації / Field for email during registration, visible only in registration mode */}
            {!isLogin && (
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Оновлення email при зміні / Update email on change
                />
            )}

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Оновлення паролю при зміні / Update password on change
            />

            <button onClick={handleAuth}>{isLogin ? 'Login' : 'Register'}</button> {/* Кнопка для входу або реєстрації / Button for login or register */}
            <p onClick={() => setIsLogin(!isLogin)}> {/* Перемикання між логіном і реєстрацією / Toggle between login and register */}
                {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
            </p>
        </div>
    );
}

export default Auth; // Експортуємо компонент Auth / Export the Auth component
