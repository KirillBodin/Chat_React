import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RoomList({ setCurrentRoom }) {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/room')
            .then(response => setRooms(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h3>Available Rooms</h3>
            <ul>
                {rooms.map((room, index) => (
                    <li key={index}>
                        {/* Удаляем использование setCurrentRoom */}
                        <Link to={`/chat/room/${room}`}>
                            {room}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RoomList;
