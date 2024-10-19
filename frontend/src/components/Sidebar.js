import React, { useState, useEffect } from 'react'; // Імпортуємо React і хуки для управління станом та ефектами / Importing React and hooks for state and effects management
import { Link, useNavigate } from 'react-router-dom'; // Імпортуємо Link і useNavigate для навігації між сторінками / Import Link and useNavigate for navigation between pages
import { List, ListItem, ListItemText, Switch, Typography, Box, Divider, Collapse, IconButton, Avatar, Button } from '@mui/material'; // Імпортуємо компоненти Material UI / Import Material UI components
import { LightMode, DarkMode, ExpandLess, ExpandMore, MoreVert, Close } from '@mui/icons-material'; // Імпортуємо іконки Material UI / Import Material UI icons
import axios from 'axios'; // Імпортуємо axios для виконання запитів до API / Import axios for API requests
import Drawer from '@mui/material/Drawer'; // Імпортуємо компонент Drawer для бічної панелі / Import Drawer component for sidebar
import { styled } from '@mui/system'; // Для анімацій та стилізації / For animations and styling

// Стиль для анімованого боксу (налаштування) / Style for the animated settings box
const AnimatedBox = styled(Box)(({ open, sidebarWidth, isDarkMode }) => ({
    transition: 'transform 0.3s ease-in-out', // Плавний перехід при відкритті / Smooth transition when opening
    transform: open ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`, // Зсув залежно від стану / Shift depending on state
    width: sidebarWidth, // Ширина бічної панелі / Sidebar width
    backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff', // Динамічний колір фону / Dynamic background color
    color: isDarkMode ? '#ffffff' : '#000000', // Динамічний колір тексту / Dynamic text color
    position: 'absolute', // Позиціонування на сторінці / Positioning on the page
    top: 0,
    left: 0,
    height: '100%', // Висота на 100% екрану / 100% screen height
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', // Тінь для елемента / Box shadow for element
    zIndex: 1300, // Високий z-index для перекриття елементів / High z-index to overlay elements
}));

function Sidebar({ user, toggleTheme, isDarkMode, setAuthenticated, avatarUrl, sidebarWidth }) {
    const [users, setUsers] = useState([]); // Стан для користувачів / State for users
    const [rooms, setRooms] = useState([]); // Стан для кімнат / State for rooms
    const [isUserListOpen, setIsUserListOpen] = useState(false); // Стан для списку користувачів / State for user list
    const [isRoomListOpen, setIsRoomListOpen] = useState(false); // Стан для списку кімнат / State for room list
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Стан для вікна налаштувань / State for settings window
    const [newAvatar, setNewAvatar] = useState(null); // Стан для нового аватара / State for new avatar
    const [avatarUrlState, setAvatarUrlState] = useState(avatarUrl); // Стан для URL аватара / State for avatar URL
    const navigate = useNavigate(); // Хук для навігації / Hook for navigation

    // Стиль для бічної панелі / Sidebar styling
    const sidebarStyle = {
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff', // Динамічний колір фону / Dynamic background color
        color: isDarkMode ? '#ffffff' : '#000000', // Динамічний колір тексту / Dynamic text color
        width: sidebarWidth, // Ширина бічної панелі / Sidebar width
    };

    // Отримуємо користувачів і кімнати при завантаженні компонента / Fetch users and rooms on component mount
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                setUsers(response.data); // Оновлюємо стан користувачів / Update users state
                const currentUser = response.data.find(usr => usr.username === user);
                if (currentUser) {
                    setAvatarUrlState(currentUser.avatarUrl); // Встановлюємо URL аватара з API / Set avatar URL from API
                }
            })
            .catch(error => console.error('Error fetching users:', error)); // Лог помилки / Log error

        axios.get('http://localhost:5000/api/room')
            .then(response => {
                setRooms(response.data); // Оновлюємо стан кімнат / Update rooms state
            })
            .catch(error => console.error('Error fetching rooms:', error)); // Лог помилки / Log error
    }, [user]); // Викликається при зміні користувача / Called when user changes

    // Відкриття/закриття списку кімнат / Toggle room list
    const toggleRoomList = () => {
        setIsRoomListOpen(!isRoomListOpen); // Змінюємо стан / Toggle state
    };

    // Відкриття/закриття списку користувачів / Toggle user list
    const toggleUserList = () => {
        setIsUserListOpen(!isUserListOpen); // Змінюємо стан / Toggle state
    };

    // Навігація до кімнати / Navigate to room
    const handleRoomClick = (roomName) => {
        navigate(`/chat/rooms/${roomName}`); // Використовуємо navigate для переходу / Use navigate for routing
    };

    // Навігація до приватного чату / Navigate to private chat
    const handlePrivateChatClick = (username) => {
        navigate(`/chat/private/${username}`); // Використовуємо navigate для переходу / Use navigate for routing
    };

    // Навігація до профілю користувача / Navigate to user's profile
    const handleProfileClick = () => {
        navigate(`/profile/${user}`);
        setIsSettingsOpen(false); // Закриваємо вікно налаштувань / Close settings window
    };

    // Навігація до налаштувань сповіщень / Navigate to notification settings
    const handleNotificationSettingsClick = () => {
        navigate(`/settings/notifications`);
        setIsSettingsOpen(false); // Закриваємо вікно налаштувань / Close settings window
    };

    // Навігація до налаштувань аккаунта / Navigate to account settings
    const handleAccountSettingsClick = () => {
        navigate(`/account-settings`);
        setIsSettingsOpen(false); // Закриваємо вікно налаштувань / Close settings window
    };

    // Обробка зміни аватара / Handle avatar change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0]; // Отримуємо файл з інпуту / Get file from input
        if (file) {
            setNewAvatar(file); // Оновлюємо стан нового аватара / Update new avatar state
        }
    };

    // Збереження змін аватара / Save avatar changes
    const handleSaveChanges = () => {
        const formData = new FormData(); // Створюємо новий об'єкт форми / Create a new form data object
        formData.append('avatar', newAvatar); // Додаємо аватар до форми / Append avatar to form data

        axios.post('http://localhost:5000/api/user/update-avatar', formData)
            .then(response => {
                setAvatarUrlState(response.data.avatarUrl); // Оновлюємо URL аватара після збереження / Update avatar URL after save
                setIsSettingsOpen(false); // Закриваємо вікно налаштувань / Close settings window
            })
            .catch(error => console.error('Error updating avatar:', error)); // Логування помилки / Log error
    };

    return (
        <>
            {/* Основна бічна панель / Main Sidebar */}
            <Drawer variant="permanent" anchor="left" PaperProps={{ style: sidebarStyle }}>
                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Avatar
                            src={`http://localhost:5000${avatarUrlState}`} // Відображаємо аватар користувача / Display user avatar
                            sx={{ width: 60, height: 60 }}
                        />
                        <IconButton onClick={() => setIsSettingsOpen(true)}> {/* Іконка для відкриття налаштувань / Icon to open settings */}
                            <MoreVert />
                        </IconButton>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Theme Mode {/* Тема: світла або темна / Theme: light or dark */}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <LightMode color={isDarkMode ? 'disabled' : 'primary'} /> {/* Іконка світлої теми / Light theme icon */}
                            <Switch checked={isDarkMode} onChange={toggleTheme} /> {/* Перемикач теми / Theme switch */}
                            <DarkMode color={isDarkMode ? 'primary' : 'disabled'} /> {/* Іконка темної теми / Dark theme icon */}
                        </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ mt: 2, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Navigation {/* Навігація / Navigation */}
                        </Typography>

                        {/* Список кімнат / Room list */}
                        <Typography variant="h5" sx={{ mt: 3, mb: 2 }} onClick={toggleRoomList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Rooms {isRoomListOpen ? <ExpandLess /> : <ExpandMore />} {/* Кімнати з іконкою розгортання / Rooms with expand icon */}
                        </Typography>

                        <Collapse in={isRoomListOpen} timeout="auto" unmountOnExit>
                            <List>
                                {rooms.length > 0 ? (
                                    rooms.map((room) => (
                                        <ListItem button key={room._id}> {/* Елемент кімнати / Room item */}
                                            <Link to={`/chat/room/${room.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <ListItemText primary={room.name} /> {/* Назва кімнати / Room name */}
                                            </Link>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No rooms available" /> {/* Повідомлення, якщо кімнат немає / Message if no rooms */}
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>

                        <Divider sx={{ mt: 3 }} />

                        {/* Список користувачів / User list */}
                        <Typography variant="h5" sx={{ mt: 3, mb: 2 }} onClick={toggleUserList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Users {isUserListOpen ? <ExpandLess /> : <ExpandMore />} {/* Користувачі з іконкою розгортання / Users with expand icon */}
                        </Typography>

                        <Collapse in={isUserListOpen} timeout="auto" unmountOnExit>
                            <List>
                                {users.length > 0 ? (
                                    users.map((usr, index) => (
                                        <ListItem button key={index} onClick={() => handlePrivateChatClick(usr.username)}> {/* Елемент користувача / User item */}
                                            <Avatar src={`http://localhost:5000${usr.avatarUrl}`} sx={{ width: 60, height: 60 }} /> {/* Аватар користувача / User avatar */}
                                            <ListItemText primary={usr.username === user ? "Saved Messages" : usr.username} /> {/* Назва елемента / Item name */}
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No users available" /> {/* Повідомлення, якщо користувачів немає / Message if no users */}
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>
                    </Box>

                    <Divider />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" align="center">
                            © 2024 ChatApp {/* Авторські права / Copyright */}
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            {/* Висувна панель налаштувань поверх бічної панелі / Slide-out settings panel on top of the Sidebar */}
            <AnimatedBox open={isSettingsOpen} sidebarWidth={sidebarWidth} isDarkMode={isDarkMode}> {/* Анімована панель / Animated panel */}
                <Box sx={{ padding: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Profile Settings</Typography> {/* Заголовок для налаштувань профілю / Profile settings header */}
                        <IconButton onClick={() => setIsSettingsOpen(false)}> {/* Кнопка для закриття налаштувань / Close settings button */}
                            <Close />
                        </IconButton>
                    </Box>
                    <Avatar src={newAvatar ? URL.createObjectURL(newAvatar) : `http://localhost:5000${avatarUrlState}`} sx={{ width: 80, height: 80, marginBottom: 2 }} /> {/* Вибраний аватар / Selected avatar */}
                    <Button variant="outlined" component="label">
                        Change Avatar {/* Змінити аватар / Change avatar */}
                        <input type="file" hidden onChange={handleAvatarChange} /> {/* Поле для вибору файлу / File input */}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleProfileClick}>
                        Profile Settings {/* Налаштування профілю / Profile settings */}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleNotificationSettingsClick}>
                        Notification Settings {/* Налаштування сповіщень / Notification settings */}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleAccountSettingsClick}>
                        Account Settings {/* Налаштування аккаунта / Account settings */}
                    </Button>
                    <Button fullWidth variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>
                        Save Changes {/* Зберегти зміни / Save changes */}
                    </Button>
                </Box>
            </AnimatedBox>
        </>
    );
}

export default Sidebar; // Експортуємо компонент Sidebar / Export Sidebar component
