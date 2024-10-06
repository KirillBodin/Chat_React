import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, Button } from '@mui/material';
import axios from 'axios';

function NotificationSettings({ user }) {
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [message, setMessage] = useState('');

    // Загружаем текущие данные настроек уведомлений пользователя
    useEffect(() => {
        axios.get(`http://localhost:5000/api/notifications/${user}`)
            .then((response) => {
                const { email, push, sms } = response.data;
                setEmailNotifications(email);
                setPushNotifications(push);
                setSmsNotifications(sms);
            })
            .catch((error) => {
                console.error('Error fetching notification settings:', error);
            });
    }, [user]);

    // Обработка сохранения настроек уведомлений
    const handleSaveSettings = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/notifications/${user}`, {
                email: emailNotifications,
                push: pushNotifications,
                sms: smsNotifications,
            });

            setMessage(response.data.message);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        }
    };

    return (
        <Box sx={{ padding: 4, marginLeft: '300px' }}>
            <Typography variant="h4" gutterBottom>
                Notification Settings
            </Typography>

            <Typography variant="h6" gutterBottom>
                Manage your notification preferences:
            </Typography>

            <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />}
                label="Email Notifications"
            />

            <FormControlLabel
                control={<Switch checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />}
                label="Push Notifications"
            />

            <FormControlLabel
                control={<Switch checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} />}
                label="SMS Notifications"
            />

            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSaveSettings}>
                Save Settings
            </Button>

            {message && (
                <Typography variant="body1" color={message.includes('Failed') ? 'error' : 'success'} sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
}

export default NotificationSettings;
