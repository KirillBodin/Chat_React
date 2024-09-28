const express = require('express');
const router = express.Router();

const rooms = ['general', 'random', 'development']; // Статический список комнат (или можно хранить в базе)

// Получение всех комнат
router.get('/rooms', (req, res) => {
    res.json(rooms);
});

module.exports = router;
