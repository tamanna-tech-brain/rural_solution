import { DarkModeProvider } from './context/DarkModeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </DarkModeProvider>
  );
}

export default App;