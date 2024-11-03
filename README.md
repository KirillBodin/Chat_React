Chat Application

Overview

This is a full-stack chat application that supports user authentication, private and group messaging, media file sharing (audio and video), and user profile management. The project is built using React for the frontend and Node.js with Express for the backend. The application also incorporates Socket.IO for real-time communication, MongoDB for data storage, and includes user notifications, profile customization, and theme toggling.

Features

User Authentication: Register and login using a secure authentication system.

Real-Time Messaging: Send and receive messages instantly in private chats and chat rooms.

Media Sharing: Upload and share audio and video messages.

Profile Management: Update profile information, change avatars, and customize bio.

Responsive Sidebar: Navigate through chat rooms and private messages with a collapsible sidebar.

Dark Mode Support: Toggle between light and dark themes.

Notification Settings: Customize notification preferences for email, push, and SMS.

Video and Audio Recording: Record audio and video messages directly from the app.

Technologies Used

Frontend

React

React Router for navigation

Material-UI (MUI) for UI components

Socket.IO-Client for real-time messaging

Video.js and videojs-record for media recording

Emoji Mart for emoji picker

Backend

Node.js and Express for the server

MongoDB with Mongoose for database management

Socket.IO for real-time communication

Multer for handling file uploads

Nodemailer for email notifications

Twilio for SMS notifications

Firebase Admin SDK for push notifications

Installation

1. Clone the repository:
git clone https://github.com/KirillBodin/Chat_React
cd chat-app
2. Install backend dependencies:
cd server
npm install
3. Install frontend dependencies:
cd ../client
npm install
4. Run the server:
npm start
5. Run the client:
cd ../client
npm start

Usage

Navigate to http://localhost:3000 to access the application.
Register or log in with your credentials.
Join chat rooms or start private conversations.
Customize your profile and notification settings.

