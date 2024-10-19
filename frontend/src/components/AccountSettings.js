import React, { useState, useEffect } from 'react'; // Імпортуємо React та хуки useState, useEffect / Import React and hooks useState, useEffect
import { TextField, Button, Box, Typography } from '@mui/material'; // Імпортуємо компоненти MUI / Import MUI components
import axios from 'axios'; // Імпортуємо axios для запитів до API / Import axios for API requests

function AccountSettings({ user }) {
    const [email, setEmail] = useState(''); // Створюємо стан для email / Create state for email
    const [currentPassword, setCurrentPassword] = useState(''); // Створюємо стан для поточного пароля / Create state for current password
    const [newPassword, setNewPassword] = useState(''); // Створюємо стан для нового пароля / Create state for new password
    const [message, setMessage] = useState(''); // Створюємо стан для повідомлення / Create state for message

    // Завантажуємо поточні дані користувача / Load current user data
    useEffect(() => {
        axios.get(`http://localhost:5000/api/users/${user}`)
            .then((response) => {
                setEmail(response.data.email); // Оновлюємо email користувача / Update user email
                // Пароль не витягуємо і не відображаємо з міркувань безпеки / Password is not retrieved or displayed for security reasons
            })
            .catch((error) => {
                console.error('Error fetching user data:', error); // Лог помилки при отриманні даних / Log error while fetching user data
            });
    }, [user]); // Виконуємо запит, коли змінюється користувач / Run the request when the user changes

    // Обробка форми / Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault(); // Запобігаємо перезавантаженню сторінки / Prevent page reload

        try {
            const response = await axios.put(`http://localhost:5000/api/account-settings/${user}`, {
                email,
                currentPassword,
                newPassword,
            }); // Відправляємо дані на сервер для оновлення налаштувань акаунта / Send data to the server to update account settings

            setMessage(response.data.message); // Оновлюємо повідомлення після успішного оновлення / Update message after successful update
        } catch (error) {
            setMessage(error.response.data.message || 'Error updating account settings'); // Оновлюємо повідомлення при помилці / Update message upon error
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 5 }}> {/* Контейнер для форми / Container for the form */}
            <Typography variant="h4" gutterBottom>
                Account Settings
            </Typography>

            {message && ( // Відображаємо повідомлення про статус операції / Display message about operation status
                <Typography variant="body1" color={message.includes('Error') ? 'error' : 'primary'} gutterBottom>
                    {message}
                </Typography>
            )}

            <form onSubmit={handleSubmit}> {/* Форма для оновлення налаштувань акаунта / Form for updating account settings */}
                {/* Поле для відображення поточного email / Field for displaying the current email */}
                <TextField
                    label="Current Email"
                    type="email"
                    value={email} // Виводимо поточний email / Display current email
                    onChange={(e) => setEmail(e.target.value)} // Оновлюємо email при зміні / Update email on change
                    fullWidth
                    margin="normal"
                />

                {/* Поле для вводу поточного пароля (не відображаємо пароль для безпеки) / Field for entering the current password (not displaying password for security) */}
                <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword} // Виводимо поточний пароль / Display current password
                    onChange={(e) => setCurrentPassword(e.target.value)} // Оновлюємо поточний пароль при зміні / Update current password on change
                    fullWidth
                    margin="normal"
                />

                {/* Поле для вводу нового пароля / Field for entering a new password */}
                <TextField
                    label="New Password"
                    type="password"
                    value={newPassword} // Виводимо новий пароль / Display new password
                    onChange={(e) => setNewPassword(e.target.value)} // Оновлюємо новий пароль при зміні / Update new password on change
                    fullWidth
                    margin="normal"
                />

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}> {/* Кнопка для збереження змін / Button to save changes */}
                    Save Changes
                </Button>
            </form>
        </Box>
    );
}

export default AccountSettings; // Експортуємо компонент AccountSettings / Exporting AccountSettings component
