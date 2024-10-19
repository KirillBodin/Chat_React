const nodemailer = require('nodemailer'); // Підключаємо модуль nodemailer для відправки електронних листів / Importing nodemailer module for sending emails

// Налаштування транспортера для Gmail / Configuring transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Ваш Gmail адреса / Your Gmail address
        pass: 'your-email-password',  // Ваш пароль або спеціальний токен додатка / Your password or app-specific token
    },
});

// Функція для відправки електронного листа / Function to send an email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'your-email@gmail.com', // Відправник / Sender
        to: to, // Отримувач / Recipient
        subject: subject, // Тема листа / Subject
        text: text, // Текст повідомлення / Message text
    };

    try {
        await transporter.sendMail(mailOptions); // Відправляємо лист / Sending the email
        console.log('Email sent successfully'); // Лог повідомлення про успішну відправку / Log success message
    } catch (error) {
        console.error('Error sending email:', error); // Лог помилки при відправці / Log error message
    }
};

module.exports = sendEmail; // Експортуємо функцію sendEmail / Exporting the sendEmail function
