// src/components/AvatarUpload.js
import React, { useState } from 'react';
import axios from 'axios';

function AvatarUpload({ user }) {
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);

        // Generate preview of the avatar image
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!avatar) return;

        const formData = new FormData();
        formData.append('avatar', avatar);

        try {
            const response = await axios.post(`http://localhost:5000/api/users/${user}/upload-avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Avatar uploaded successfully!');
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    return (
        <div className="avatar-upload">
            <h4>Upload Avatar</h4>
            <input type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="avatar preview" className="avatar-preview" />}
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default AvatarUpload;
