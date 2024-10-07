import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RoomList() {
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
                        {/* Access the room's name instead of the entire object */}
                        <Link to={`/chat/room/${room.name}`}>
                            {room.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RoomList;
