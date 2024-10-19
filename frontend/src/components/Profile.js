import React, { useEffect, useState } from 'react'; // Імпортуємо React та хуки useEffect, useState для управління станом та життєвим циклом / Import React and hooks useEffect, useState for state and lifecycle management
import { useParams } from 'react-router-dom'; // Імпортуємо useParams для отримання параметрів з URL / Import useParams for extracting parameters from the URL
import axios from 'axios'; // Імпортуємо axios для роботи з API / Import axios for API calls
import {
    Button,
    TextField,
    Typography,
    Container,
    Avatar,
    CircularProgress
} from '@mui/material'; // Імпортуємо компоненти Material UI / Import Material UI components
import { styled } from '@mui/system'; // Імпортуємо styled для стилізації компонентів / Import styled for component styling
import '../css/Profile.css'; // Імпортуємо CSS для стилізації профілю / Import CSS for profile styling

// Стиль для контейнера аватара / Style for avatar container
const Input = styled('input')({
    display: 'none', // Приховуємо елемент input / Hide input element
});

function Profile() {
    const { username } = useParams(); // Отримуємо ім'я користувача з URL / Extract username from URL parameters
    const [userInfo, setUserInfo] = useState(null); // Стан для інформації про користувача / State for user information
    const [isEditing, setIsEditing] = useState(false); // Стан для режиму редагування / State for edit mode
    const [newName, setNewName] = useState(''); // Стан для нового імені користувача / State for new username
    const [newBio, setNewBio] = useState(''); // Стан для нової біографії / State for new bio
    const [selectedImage, setSelectedImage] = useState(null); // Стан для завантаженого аватара / State for selected avatar image
    const [isLoading, setIsLoading] = useState(false); // Стан для індикатора завантаження / State for loading indicator

    // Викликаємо API для отримання даних користувача при завантаженні компонента / Fetch user data when component loads
    useEffect(() => {
        axios.get(`http://localhost:5000/api/users/${username}`)
            .then(response => {
                setUserInfo(response.data); // Оновлюємо стан з інформацією користувача / Update state with user info
                setNewName(response.data.username); // Оновлюємо ім'я користувача / Update username
                setNewBio(response.data.bio || ''); // Оновлюємо біографію або встановлюємо порожнє значення / Update bio or set empty
            })
            .catch(error => console.error(error)); // Логування помилки / Log error
    }, [username]); // Виконуємо запит при зміні імені користувача / Run the request when username changes

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]); // Оновлюємо стан із завантаженим зображенням / Update state with selected image
    };

    const handleSave = () => {
        setIsLoading(true); // Включаємо індикатор завантаження / Show loading indicator
        const formData = new FormData();
        formData.append('username', newName); // Додаємо нове ім'я користувача у форму / Append new username to form data
        formData.append('bio', newBio); // Додаємо біографію / Append bio
        if (selectedImage) {
            formData.append('avatar', selectedImage); // Додаємо аватар, якщо вибрано / Append avatar if selected
        }

        // Відправляємо оновлені дані користувача на сервер / Send updated user data to server
        axios.put(`http://localhost:5000/api/users/${username}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Встановлюємо заголовок для завантаження файлів / Set header for file upload
            },
        })
            .then(response => {
                setUserInfo(response.data); // Оновлюємо інформацію користувача після збереження / Update user info after save
                setIsEditing(false); // Виходимо з режиму редагування / Exit edit mode
                setIsLoading(false); // Вимикаємо індикатор завантаження / Turn off loading indicator
            })
            .catch(error => {
                console.error(error); // Логування помилки при збереженні / Log error during save
                setIsLoading(false); // Вимикаємо індикатор завантаження у разі помилки / Turn off loading indicator on error
            });
    };

    if (!userInfo) { // Показуємо індикатор завантаження, якщо дані ще не отримані / Show loading indicator if user info is not yet fetched
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm" className="profile-container"> {/* Контейнер для профілю / Profile container */}
            <Typography variant="h4" gutterBottom>
                Profile Settings {/* Заголовок для налаштувань профілю / Profile settings header */}
            </Typography>
            <label htmlFor="avatar-upload"> {/* Поле для завантаження аватара / Field for uploading avatar */}
                <Input
                    accept="image/*"
                    id="avatar-upload"
                    type="file"
                    onChange={handleImageChange} // Оновлюємо стан при виборі нового зображення / Update state when a new image is selected
                />
                <Avatar
                    alt="User avatar" // Альтернативний текст для аватара / Alt text for avatar
                    src={selectedImage ? URL.createObjectURL(selectedImage) : userInfo.avatarUrl || '/default-avatar.png'} // Показуємо вибране зображення або аватар користувача / Show selected image or user's avatar
                    sx={{ width: 100, height: 100, margin: '20px auto', cursor: 'pointer' }} // Стилізація аватара / Avatar styling
                />
            </label>

            <TextField
                label="Username"
                value={newName} // Виводимо поточне ім'я користувача / Display current username
                onChange={(e) => setNewName(e.target.value)} // Оновлюємо стан при зміні імені / Update state when username changes
                fullWidth
                margin="normal"
            />

            <TextField
                label="Bio"
                value={newBio} // Виводимо поточну біографію / Display current bio
                onChange={(e) => setNewBio(e.target.value)} // Оновлюємо стан при зміні біографії / Update state when bio changes
                fullWidth
                multiline
                rows={4} // Виводимо біографію на кілька рядків / Show bio in multiple rows
                margin="normal"
            />

            <div style={{ marginTop: '20px' }}> {/* Контейнер для кнопки збереження / Container for save button */}
                {!isLoading ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave} // Обробка натискання кнопки збереження / Handle save button click
                        fullWidth
                    >
                        Save Changes {/* Текст кнопки збереження / Save button text */}
                    </Button>
                ) : (
                    <CircularProgress /> // Показуємо індикатор завантаження при збереженні / Show loading indicator while saving
                )}
            </div>
        </Container>
    );
}

export default Profile; // Експортуємо компонент Profile / Export Profile component
