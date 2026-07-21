import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextStore';

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const setDarkMode = (value) => setDarkModeState(value);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};