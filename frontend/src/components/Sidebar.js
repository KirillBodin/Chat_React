import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Switch, Typography, Box, Divider, Collapse, IconButton, Avatar, Drawer as MUIDrawer, Button, Modal, TextField } from '@mui/material';
import { LightMode, DarkMode, ExpandLess, ExpandMore, MoreVert } from '@mui/icons-material';
import axios from 'axios';
import Drawer from '@mui/material/Drawer';

function Sidebar({ user, toggleTheme, isDarkMode, setAuthenticated }) {
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]); // State for room list
    const [isUserListOpen, setIsUserListOpen] = useState(false); // State for collapsing/expanding user list
    const [isRoomListOpen, setIsRoomListOpen] = useState(false); // State for collapsing/expanding room list
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for opening settings modal
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false); // State for room creation modal
    const [newRoomName, setNewRoomName] = useState(''); // State for new room name
    const [uploadMessage, setUploadMessage] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const navigate = useNavigate();

    const sidebarStyle = {
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        width: 300,
    };

    // Fetch users and rooms on mount
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));

        axios.get('http://localhost:5000/api/room')
            .then(response => {
                console.log('Fetched rooms:', response.data); // Log the rooms data
                setRooms(response.data);
            })
            .catch(error => console.error('Error fetching rooms:', error));
    }, []);

    // Toggle room list visibility
    const toggleRoomList = () => {
        setIsRoomListOpen(!isRoomListOpen);
    };

    // Toggle user list visibility
    const toggleUserList = () => {
        setIsUserListOpen(!isUserListOpen);
    };

    // Handle room creation
    const handleCreateRoom = () => {
        if (!newRoomName.trim()) {
            return; // Don't create a room if the name is empty
        }

        axios.post('http://localhost:5000/api/room', { name: newRoomName })
            .then(response => {
                console.log('Created room:', response.data); // Log the newly created room
                setRooms([...rooms, response.data.room]); // Add new room to the list
                setIsCreateRoomOpen(false); // Close modal after creation
                setNewRoomName(''); // Clear the input field
            })
            .catch(error => console.error('Error creating room:', error));
    };

    // Handle navigation to a room
    const handleRoomClick = (roomName) => {
        navigate(`/chat/rooms/${roomName}`); // Redirect to the room's page
    };

    // Handle navigation to a private chat
    const handlePrivateChatClick = (username) => {
        navigate(`/chat/private/${username}`); // Redirect to the private chat page
    };

    return (
        <>
            {/* Main Sidebar */}
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

                    {/* Ensure onClick is correctly defined for this button */}
                    <IconButton onClick={() => setIsSettingsOpen(true)} style={{ alignSelf: 'flex-end' }}>
                        <MoreVert />
                    </IconButton>

                    <Box sx={{ mt: 2, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Navigation
                        </Typography>

                        {/* Room List */}
                        <Typography variant="h5" sx={{ mt: 3, mb: 2 }} onClick={toggleRoomList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Rooms {isRoomListOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>

                        <Collapse in={isRoomListOpen} timeout="auto" unmountOnExit>
                            <List>
                                {rooms.length > 0 ? (
                                    rooms.map((room) => (
                                        <ListItem button key={room._id}>
                                            <Link to={`/chat/room/${room.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <ListItemText primary={room.name} />
                                            </Link>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No rooms available" />
                                    </ListItem>
                                )}
                            </List>
                        </Collapse>

                        <Button variant="contained" color="primary" onClick={() => setIsCreateRoomOpen(true)} sx={{ mt: 2 }}>
                            Create Room
                        </Button>

                        <Divider sx={{ mt: 3 }} />

                        {/* User List */}
                        <Typography variant="h5" sx={{ mt: 3, mb: 2 }} onClick={toggleUserList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            Users {isUserListOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>

                        <Collapse in={isUserListOpen} timeout="auto" unmountOnExit>
                            <List>
                                {users.length > 0 ? (
                                    users.map((usr, index) => (
                                        <ListItem button key={index} onClick={() => handlePrivateChatClick(usr.username)}>
                                            <Avatar src={usr.avatarUrl} />
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

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" align="center">
                            © 2024 ChatApp
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            {/* Room Creation Modal */}
            <Modal
                open={isCreateRoomOpen}
                onClose={() => setIsCreateRoomOpen(false)}
                aria-labelledby="create-room-modal"
                aria-describedby="create-room-modal-description"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, boxShadow: 24 }}>
                    <Typography variant="h6" id="create-room-modal" sx={{ mb: 2 }}>
                        Create New Room
                    </Typography>
                    <TextField
                        label="Room Name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleCreateRoom}>
                        Create Room
                    </Button>
                </Box>
            </Modal>
        </>
    );
}

export default Sidebar;
