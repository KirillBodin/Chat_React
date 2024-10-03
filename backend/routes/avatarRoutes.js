const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Directory where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.username}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Route to upload avatar
router.post('/upload', upload.single('avatar'), (req, res) => {
    try {
        res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatarUrl: `/uploads/${req.file.filename}`  // The URL of the uploaded image
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar', error });
    }
});

module.exports = router;
