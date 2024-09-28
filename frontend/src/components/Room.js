import React, { useState } from 'react';

function Room({ joinRoom }) {
    const [room, setRoom] = useState('');

    const handleJoin = () => {
        if (room) {
            joinRoom(room);
        }
    };

    return (
        <div>
            <h3>Choose a Room</h3>
            <input
                type="text"
                placeholder="Room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoin}>Join Room</button>
        </div>
    );
}

export default Room;
