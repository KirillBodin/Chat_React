import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../css/Sidebar.css'; // Подключаем стили

function Sidebar({ user }) {
    const [users, setUsers] = useState([]);
    const [isUserListOpen, setIsUserListOpen] = useState(false); // Управление видимостью списка пользователей

    // Отладка: выведем в консоль результат запроса
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                console.log('Users data:', response.data); // Для проверки данных из API
                setUsers(response.data);
            })
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    // Функция для переключения видимости списка пользователей
    const toggleUserList = () => {
        setIsUserListOpen(prevState => !prevState);
    };

    return (
        <div className="sidebar">
            <h2>Navigation</h2>
            <ul>
                <li>
                    <Link to="/chat/rooms">Rooms</Link>
                </li>
                <li>
                    <Link to={`/profile/${user}`}>Profile</Link>
                </li>
                <li>
                    {/* Заголовок Users */}
                    <h3 onClick={toggleUserList} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        Users {isUserListOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </h3>
                    {/* Выпадающий список пользователей */}
                    {isUserListOpen && (
                        <ul className="user-list">
                            {users.length > 0 ? (
                                users.map((usr, index) => (
                                    <li key={index}>
                                        <Link to={`/chat/private/${usr.username}`}>
                                            {usr.username}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>No users available</li>
                            )}
                        </ul>
                    )}
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
