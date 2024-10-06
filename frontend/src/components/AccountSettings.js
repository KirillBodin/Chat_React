import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

function AccountSettings({ user }) {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    // Загружаем текущие данные пользователя
    useEffect(() => {
        axios.get(`http://localhost:5000/api/users/${user}`)
            .then((response) => {
                setEmail(response.data.email);
                // Пароль не извлекаем и не показываем для безопасности
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    }, [user]);

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(`http://localhost:5000/api/account-settings/${user}`, {
                email,
                currentPassword,
                newPassword,
            });

            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.message || 'Error updating account settings');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Account Settings
            </Typography>

            {message && (
                <Typography variant="body1" color={message.includes('Error') ? 'error' : 'primary'} gutterBottom>
                    {message}
                </Typography>
            )}

            <form onSubmit={handleSubmit}>
                {/* Поле для отображения текущего email */}
                <TextField
                    label="Current Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                {/* Поле для ввода текущего пароля (не отображаем текущий пароль для безопасности) */}
                <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                {/* Поле для ввода нового пароля */}
                <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                    Save Changes
                </Button>
            </form>
        </Box>
    );
}

export default AccountSettings;
