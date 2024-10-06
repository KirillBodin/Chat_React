import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Switch, Typography, Box, Divider, Collapse, IconButton, Avatar, Drawer as MUIDrawer, Button } from '@mui/material';
import { LightMode, DarkMode, ExpandLess, ExpandMore, MoreVert } from '@mui/icons-material';
import axios from 'axios';
import Drawer from '@mui/material/Drawer';

function Sidebar({ user, toggleTheme, isDarkMode, setAuthenticated }) {
    const [users, setUsers] = useState([]); // Состояние для хранения списка пользователей
    const [isUserListOpen, setIsUserListOpen] = useState(false); // Состояние для сворачивания/разворачивания списка
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Состояние для открытия бокового окна
    const [selectedFile, setSelectedFile] = useState(null); // Состояние для хранения выбранного изображения
    const [uploadMessage, setUploadMessage] = useState(''); // Сообщение после загрузки
    const [avatarUrl, setAvatarUrl] = useState(''); // Состояние для URL аватара

    const navigate = useNavigate(); // Для перенаправления на другие страницы

    const sidebarStyle = {
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        width: 300, // Увеличиваем ширину
    };

    // Получаем список пользователей при монтировании компонента
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                setUsers(response.data);

            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/users/${user}`)
            .then(response => {
                setAvatarUrl(response.data.avatarUrl); // Устанавливаем URL аватара из ответа
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, [user]);

    // Функция для переключения состояния сворачивания/разворачивания списка пользователей
    const toggleUserList = () => {
        setIsUserListOpen(!isUserListOpen);
    };

    // Открытие/закрытие окна настроек
    const handleSettingsOpen = () => {
        setIsSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    // Обработка выбора файла изображения и отправка его на сервер
    const handleFileChangeAndUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setUploadMessage('Please select a file first');
            return;
        }

        setSelectedFile(file);

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('username', user); // Отправляем имя пользователя для привязки аватара

        try {
            const response = await axios.post('http://localhost:5000/api/users/avatar/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadMessage('Avatar uploaded successfully!');
        } catch (error) {
            setUploadMessage('Error uploading avatar');
            console.error('Upload error:', error);
        }
    };

    // Логика выхода пользователя
    const handleLogout = () => {
        // Удаление данных из localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Обновление состояния аутентификации
        setAuthenticated(false);

        // Перенаправление на страницу аутентификации
        navigate('/auth');
    };

    return (
        <>
            {/* Основной Sidebar */}
            <Drawer variant="permanent" anchor="left" PaperProps={{ style: sidebarStyle }}>
                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Theme Mode
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <LightMode color={isDarkMode ? 'disabled' : 'primary'} />
                            <Switch checked={isDarkMode} onChange={toggleTheme} />
                            <DarkMode color={isDarkMode ? 'primary' : 'disabled'} />
                        </Box>
                    </Box>

                    <Divider />

                    {/* Кнопка троеточие сверху */}
                    <IconButton onClick={handleSettingsOpen} style={{ alignSelf: 'flex-end' }}>
                        <MoreVert />
                    </IconButton>

                    <Box sx={{ mt: 2, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Navigation
                        </Typography>
                        <List>
                            <ListItem button component={Link} to="/chat/rooms">
                                <ListItemText primary="Rooms" />
                            </ListItem>
                        </List>

                        <Typography variant="h5" sx={{ mt: 3, mb: 2 }} onClick={toggleUserList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Users {isUserListOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>

                        {/* Список пользователей, который можно свернуть/развернуть */}
                        <Collapse in={isUserListOpen} timeout="auto" unmountOnExit>
                            <List>
                                {users.length > 0 ? (
                                    users.map((usr, index) => (
                                        <ListItem button component={Link} to={`/chat/private/${usr.username}`} key={index}>
                                            <ListItemText primary={usr.username} />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No users available" />
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>
                    </Box>

                    <Divider />

                    {/* Кнопка троеточие снизу */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" align="center">
                            © 2024 ChatApp
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            {/* Окно настроек */}
            <MUIDrawer
                anchor="left"
                open={isSettingsOpen}
                onClose={handleSettingsClose}
                transitionDuration={500}
            >
                <Box sx={{ width: 300, padding: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Settings</Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* Выбор фото */}
                    <Avatar
                        sx={{ width: 100, height: 100, margin: '0 auto 20px' }}
                        src={`http://localhost:5000${avatarUrl}`}  // Префикс URL сервера для загрузки аватарки
                    />

                    <Button variant="contained" component="label">
                        Choose and Upload Photo
                        <input type="file" hidden onChange={handleFileChangeAndUpload} />
                    </Button>
                    {uploadMessage && <Typography color="primary">{uploadMessage}</Typography>}

                    {/* Настройки */}
                    <List>
                        <ListItem button component={Link} to="/settings/notifications">
                            <ListItemText primary="Notification Settings" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Privacy Settings" />
                        </ListItem>
                        <ListItem button component={Link} to="/account-settings">
                            <ListItemText primary="Account Settings" />
                        </ListItem>
                        <ListItem button component={Link} to="/about">
                            <ListItemText primary="About" />
                        </ListItem>
                        <ListItem button component={Link} to="/support">
                            <ListItemText primary="Support" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>

                    <Button variant="contained" color="primary" onClick={handleSettingsClose} sx={{ mt: 2 }}>
                        Close
                    </Button>
                </Box>
            </MUIDrawer>
        </>
    );
}

export default Sidebar;
