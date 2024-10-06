const nodemailer = require('nodemailer');

// Настройка Nodemailer с использованием SMTP (например, Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Укажи свою почту
        pass: 'your-email-password',  // Пароль или специальный токен приложения
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
