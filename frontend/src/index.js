import React from 'react'; // Імпортуємо React для створення компонентів / Import React to create components
import ReactDOM from 'react-dom/client'; // Імпортуємо ReactDOM для рендеринга додатку / Import ReactDOM to render the app
import App from './App'; // Імпортуємо компонент App / Import App component
import { ThemeProvider } from 'styled-components'; // Імпортуємо ThemeProvider для темізації / Import ThemeProvider for theming

// Тема для додатку / Theme for the application
const theme = {
    colors: {
        primary: '#0070f3', // Основний колір / Primary color
        secondary: '#1a1a1a', // Вторинний колір / Secondary color
    },
    fontSizes: {
        small: '12px', // Малий розмір шрифту / Small font size
        medium: '16px', // Середній розмір шрифту / Medium font size
        large: '18px', // Великий розмір шрифту / Large font size
    },
};

// Створюємо кореневий елемент для рендерингу додатку / Create root element to render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}> {/* Передаємо тему через ThemeProvider / Provide theme via ThemeProvider */}
        <React.StrictMode> {/* StrictMode для виявлення потенційних проблем / StrictMode to detect potential issues */}
            <App /> {/* Рендеримо компонент App / Render App component */}
        </React.StrictMode>
    </ThemeProvider>,
);


