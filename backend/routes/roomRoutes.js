const express = require('express');
const router = express.Router();

const rooms = ['general', 'random', 'development'];

// Получение всех комнат
router.get('/', (req, res) => {
    res.json(rooms);
});

module.exports = router;
