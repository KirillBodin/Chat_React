import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    TextField,
    Typography,
    Container,
    Avatar,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import '../css/Profile.css';

// Стиль для контейнера аватара
const Input = styled('input')({
    display: 'none',
});

function Profile() {
    const { username } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Получаем данные пользователя по username
        axios.get(`http://localhost:5000/api/users/${username}`)
            .then(response => {
                setUserInfo(response.data);
                setNewName(response.data.username);
                setNewBio(response.data.bio || '');
            })
            .catch(error => console.error(error));
    }, [username]);

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]);
    };

    const handleSave = () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('username', newName);
        formData.append('bio', newBio);
        if (selectedImage) {
            formData.append('avatar', selectedImage);
        }

        // Отправляем обновленные данные пользователя на сервер
        axios.put(`http://localhost:5000/api/users/${username}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(response => {
                setUserInfo(response.data);
                setIsEditing(false);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(error);
                setIsLoading(false);
            });
    };

    if (!userInfo) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm" className="profile-container">
            <Typography variant="h4" gutterBottom>
                Profile Settings
            </Typography>
            <label htmlFor="avatar-upload">
                <Input
                    accept="image/*"
                    id="avatar-upload"
                    type="file"
                    onChange={handleImageChange}
                />
                <Avatar
                    alt="User avatar"
                    src={selectedImage ? URL.createObjectURL(selectedImage) : userInfo.avatarUrl || '/default-avatar.png'}
                    sx={{ width: 100, height: 100, margin: '20px auto', cursor: 'pointer' }}
                />
            </label>

            <TextField
                label="Username"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                fullWidth
                margin="normal"
            />

            <TextField
                label="Bio"
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
            />

            <div style={{ marginTop: '20px' }}>
                {!isLoading ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        fullWidth
                    >
                        Save Changes
                    </Button>
                ) : (
                    <CircularProgress />
                )}
            </div>
        </Container>
    );
}

export default Profile;
