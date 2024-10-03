import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        primary: '#0070f3',
        secondary: '#1a1a1a',
    },
    fontSizes: {
        small: '12px',
        medium: '16px',
        large: '18px',
    },
};

// Удалите или закомментируйте следующие строки
// import './index.css';
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
    <React.StrictMode>
        <App />
    </React.StrictMode>
    </ThemeProvider>,
);

// Удалите или закомментируйте вызов reportWebVitals
// reportWebVitals();
