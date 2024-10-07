const express = require('express');
const router = express.Router();
const Room = require('../models/Room'); // Import the Room model

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find(); // Fetch all rooms from the database
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
});

// Create a new room
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room already exists' });
        }
        const room = new Room({ name });
        await room.save();
        res.status(201).json({ message: 'Room created successfully', room });
    } catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
});


module.exports = router;
