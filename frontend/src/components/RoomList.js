import React, { useState, useEffect } from 'react'; // Імпортуємо React і хуки для управління станом та ефектами / Importing React and hooks for state and effects management
import { Link } from 'react-router-dom'; // Імпортуємо Link для навігації між сторінками / Import Link for navigation between pages
import axios from 'axios'; // Імпортуємо axios для виконання запитів до API / Import axios for API requests

function RoomList() {
    const [rooms, setRooms] = useState([]); // Стан для списку кімнат / State for the list of rooms

    // Виконуємо запит до сервера для отримання доступних кімнат / Fetch available rooms from the server
    useEffect(() => {
        axios.get('http://localhost:5000/api/room')
            .then(response => setRooms(response.data)) // Оновлюємо стан з отриманими даними / Update state with the fetched data
            .catch(error => console.error(error)); // Логування помилки / Log error
    }, []); // Ефект спрацьовує один раз при завантаженні компонента / Effect runs once when component mounts

    return (
        <div>
            <h3>Available Rooms</h3> {/* Заголовок для списку кімнат / Header for the room list */}
            <ul>
                {rooms.map((room, index) => (
                    <li key={index}> {/* Використовуємо ключ для кожного елемента списку / Use key for each list item */}
                        <Link to={`/chat/room/${room.name}`}> {/* Створюємо посилання для переходу в кімнату / Create a link to navigate to the room */}
                            {room.name} {/* Відображаємо назву кімнати / Display room name */}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RoomList; // Експортуємо компонент RoomList / Export RoomList component
