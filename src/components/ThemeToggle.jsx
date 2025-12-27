import { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser le thème système
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Appliquer le thème au chargement
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={`Passer au thème ${theme === 'light' ? 'sombre' : 'clair'}`}
      title={`Passer au thème ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <span className="theme-icon">🌙</span>
      ) : (
        <span className="theme-icon">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;
