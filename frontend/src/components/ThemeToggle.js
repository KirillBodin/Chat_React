import React, { useContext } from 'react'; // Імпортуємо React і хук useContext для доступу до контексту / Importing React and useContext hook to access context
import { ThemeContext } from '../context/ThemeContext'; // Імпортуємо контекст теми / Importing ThemeContext

function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext); // Отримуємо поточну тему та функцію перемикання з контексту / Getting the current theme and toggle function from the context

    return (
        <button onClick={toggleTheme}> {/* Кнопка для перемикання теми / Button for toggling the theme */}
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'} {/* Відображаємо текст залежно від поточної теми / Display text based on the current theme */}
        </button>
    );
}

export default ThemeToggle; // Експортуємо компонент ThemeToggle / Export ThemeToggle component
