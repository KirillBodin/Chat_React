import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Switch, Typography, Box, Divider, Collapse } from '@mui/material';
import { LightMode, DarkMode, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Drawer } from '@mui/material';
import axios from 'axios';

function Sidebar({ user, toggleTheme, isDarkMode }) {
    const [users, setUsers] = useState([]); // Состояние для хранения списка пользователей
    const [isUserListOpen, setIsUserListOpen] = useState(false); // Состояние для сворачивания/разворачивания списка

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

    // Функция для переключения состояния сворачивания/разворачивания списка пользователей
    const toggleUserList = () => {
        setIsUserListOpen(!isUserListOpen);
    };

    return (
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

                <Box sx={{ mt: 2, flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Navigation
                    </Typography>
                    <List>
                        <ListItem button component={Link} to="/chat/rooms">
                            <ListItemText primary="Rooms" />
                        </ListItem>

                        <ListItem button component={Link} to={`/profile/${user}`}>
                            <ListItemText primary="Profile" />
                        </ListItem>

                        <ListItem button component={Link} to="/settings">
                            <ListItemText primary="Settings" />
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
                    <List>
                        <ListItem button component={Link} to="/about">
                            <ListItemText primary="About" />
                        </ListItem>

                        <ListItem button component={Link} to="/support">
                            <ListItemText primary="Support" />
                        </ListItem>

                        <ListItem button component={Link} to="/logout">
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Box>

                <Divider />

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" align="center">
                        © 2024 ChatApp
                    </Typography>
                </Box>
            </Box>
        </Drawer>
    );
}

export default Sidebar;
