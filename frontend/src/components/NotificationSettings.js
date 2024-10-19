import React, { useState, useEffect } from 'react'; // Імпортуємо React і хуки для управління станом та життєвим циклом / Import React and hooks for state and lifecycle management
import { Box, Typography, Switch, FormControlLabel, Button } from '@mui/material'; // Імпортуємо компоненти Material UI / Import Material UI components
import axios from 'axios'; // Імпортуємо axios для роботи з API / Import axios for API calls

function NotificationSettings({ user }) {
    const [emailNotifications, setEmailNotifications] = useState(false); // Стан для налаштувань email сповіщень / State for email notification settings
    const [pushNotifications, setPushNotifications] = useState(false); // Стан для налаштувань push сповіщень / State for push notification settings
    const [smsNotifications, setSmsNotifications] = useState(false); // Стан для налаштувань SMS сповіщень / State for SMS notification settings
    const [message, setMessage] = useState(''); // Стан для відображення повідомлення / State for displaying a message

    // Завантаження поточних налаштувань сповіщень користувача / Fetch current user notification settings
    useEffect(() => {
        axios.get(`http://localhost:5000/api/notifications/${user}`)
            .then((response) => {
                const { email, push, sms } = response.data; // Отримуємо налаштування з відповіді сервера / Extract settings from server response
                setEmailNotifications(email); // Оновлюємо стан email сповіщень / Update email notification state
                setPushNotifications(push); // Оновлюємо стан push сповіщень / Update push notification state
                setSmsNotifications(sms); // Оновлюємо стан SMS сповіщень / Update SMS notification state
            })
            .catch((error) => {
                console.error('Error fetching notification settings:', error); // Логування помилки / Log error
            });
    }, [user]); // Викликаємо ефект при зміні користувача / Run effect when user changes

    // Обробка збереження налаштувань сповіщень / Handler for saving notification settings
    const handleSaveSettings = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/notifications/${user}`, {
                email: emailNotifications, // Відправляємо оновлені налаштування email / Send updated email settings
                push: pushNotifications, // Відправляємо оновлені налаштування push / Send updated push settings
                sms: smsNotifications, // Відправляємо оновлені налаштування SMS / Send updated SMS settings
            });

            setMessage(response.data.message); // Оновлюємо повідомлення після успішного збереження / Update message after successful save
        } catch (error) {
            console.error('Error saving settings:', error); // Логування помилки / Log error
            setMessage('Failed to save settings'); // Відображаємо помилку при невдалій спробі збереження / Display error message upon failed save
        }
    };

    return (
        <Box sx={{ padding: 4, marginLeft: '300px' }}> {/* Контейнер для налаштувань сповіщень / Container for notification settings */}
            <Typography variant="h4" gutterBottom>
                Notification Settings {/* Заголовок для налаштувань сповіщень / Header for notification settings */}
            </Typography>

            <Typography variant="h6" gutterBottom>
                Manage your notification preferences: {/* Підзаголовок для налаштувань / Subtitle for notification preferences */}
            </Typography>

            <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />} // Перемикач для email сповіщень / Switch for email notifications
                label="Email Notifications"
            />

            <FormControlLabel
                control={<Switch checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />} // Перемикач для push сповіщень / Switch for push notifications
                label="Push Notifications"
            />

            <FormControlLabel
                control={<Switch checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} />} // Перемикач для SMS сповіщень / Switch for SMS notifications
                label="SMS Notifications"
            />

            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSaveSettings}> {/* Кнопка для збереження налаштувань / Button to save settings */}
                Save Settings
            </Button>

            {message && ( // Відображаємо повідомлення після збереження / Display message after save
                <Typography variant="body1" color={message.includes('Failed') ? 'error' : 'success'} sx={{ mt: 2 }}>
                    {message} {/* Відображаємо повідомлення користувачу / Display message to the user */}
                </Typography>
            )}
        </Box>
    );
}

export default NotificationSettings; // Експортуємо компонент NotificationSettings / Export NotificationSettings component
