import { useContext } from 'react';
import { DarkModeContext } from '../context/darkModeContextInstance';

export const useDarkMode = () => {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider');
  return ctx;
};

export default useDarkMode;
