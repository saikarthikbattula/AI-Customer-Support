'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Box, Stack, TextField, Button, Typography, IconButton, createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { auth, provider, signInWithPopup, signOut } from './firebaseConfig';

// Create a Theme Context
const ThemeContext = createContext();
const AuthContext = createContext();

const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === 'light' ? '#ffffff' : '#121212',
          },
          text: {
            primary: mode === 'light' ? '#000000' : '#ffffff',
          },
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

const useThemeContext = () => useContext(ThemeContext);
const useAuthContext = () => useContext(AuthContext);

// i18n Configuration
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "welcome": "Hi there! I'm the Headstarter virtual assistant. How can I help?",
        "sendMessage": "Send Message",
        "messageLabel": "Message",
        "rateLabel": "Rate this response:",
        "rateButton": "Submit Rating",
        "login": "Login",
        "logout": "Logout"
      }
    },
    fr: {
      translation: {
        "welcome": "Salut! Je suis l'assistant virtuel Headstarter. Comment puis-je vous aider?",
        "sendMessage": "Envoyer un message",
        "messageLabel": "Message",
        "rateLabel": "Évaluez cette réponse :",
        "rateButton": "Soumettre l'évaluation",
        "login": "Se connecter",
        "logout": "Se déconnecter"
      }
    },
    es: {
      translation: {
        "welcome": "¡Hola! Soy el asistente virtual Headstarter. ¿Cómo puedo ayudarte?",
        "sendMessage": "Enviar mensaje",
        "messageLabel": "Mensaje",
        "rateLabel": "Califica esta respuesta:",
        "rateButton": "Enviar calificación",
        "login": "Iniciar sesión",
        "logout": "Cerrar sesión"
      }
    }
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already does escaping
  }
});

// Home Component
const Home = () => {
  const { mode, toggleColorMode, theme } = useThemeContext();
  const { t, i18n } = useTranslation();
  const { user, login, logout } = useAuthContext();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, responseIndex: null });
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const setUser = (user) => {
    // Handle user state updates
    console.log('User:', user);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    setHistory((history) => [...history, { role: "user", parts: [{ text: message }] }]);
    setMessage('');

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...history, { role: "user", parts: [{ text: message }] }])
      });

      const data = await response.json();

      if (typeof data !== 'string') {
        console.error('Received non-string data:', data);
        return;
      }

      setHistory((history) => [...history, { role: "model", parts: [{ text: data }] }]);
      setFeedback({ ...feedback, responseIndex: history.length });
      setShowFeedback(true);
    } catch (e) {
      console.error('Error in sendMessage:', e);
      setHistory((history) => [...history, { role: "model", parts: [{ text: "Error occurred, please try again later." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const submitFeedback = async () => {
    if (feedback.rating === 0 || feedback.responseIndex === null) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: feedback.rating,
          responseIndex: feedback.responseIndex
        })
      });

      console.log('Feedback submitted successfully');
      setShowFeedback(false);
      setFeedback({ rating: 0, responseIndex: null });
    } catch (e) {
      console.error('Error in submitFeedback:', e);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
      position="relative"
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="600px"
        height="80%"
        maxHeight="80%"
        border={`1px solid ${theme.palette.divider}`}
        borderRadius={8}
        spacing={2}
        bgcolor="background.paper"
        boxShadow={3}
        p={2}
      >
        <Box position="absolute" top={16} left={16}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Box>
        <Stack direction="column" spacing={2} overflow="auto" flexGrow={1}>
          <Box
            display="flex"
            justifyContent="flex-start"
            bgcolor="secondary.main"
            borderRadius={20}
            p={2}
            maxWidth="80%"
            boxShadow={2}
          >
            <Typography
              color="white"
              variant="body1"
              sx={{ wordBreak: 'break-word' }}
            >
              {t('welcome')}
            </Typography>
          </Box>
          {history.map((textObject, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={textObject.role === 'user' ? 'flex-start' : 'flex-end'}
              mb={1}
            >
              <Box
                bgcolor={textObject.role === 'user' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={20}
                p={2}
                maxWidth="80%"
                boxShadow={1}
                sx={{ wordBreak: 'break-word' }}
              >
                {textObject.parts && textObject.parts[0] && textObject.parts[0].text}
              </Box>
            </Box>
          ))}
        </Stack>
        {showFeedback && (
          <Box mt={2}>
            <Typography>{t('rateLabel')}</Typography>
            <Stack direction="row" spacing={1} mt={1}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                  variant={feedback.rating === star ? 'contained' : 'outlined'}
                  color="primary"
                >
                  {star}
                </Button>
              ))}
            </Stack>
            <Button onClick={submitFeedback} sx={{ mt: 2 }}>
              {t('rateButton')}
            </Button>
          </Box>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label={t('messageLabel')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: 'text.primary' } }}
            InputProps={{
              style: { color: 'text.primary', padding: '10px' }
            }}
            sx={{ borderRadius: 1 }}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            sx={{ height: '100%' }}
          >
            {isLoading ? 'Sending...' : t('sendMessage')}
          </Button>
        </Stack>
        {/* Language Switcher */}
        <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
          <Button onClick={() => i18n.changeLanguage('en')}>English</Button>
          <Button onClick={() => i18n.changeLanguage('fr')}>Français</Button>
          <Button onClick={() => i18n.changeLanguage('es')}>Español</Button>
        </Stack>
        {/* Authentication */}
        <Box display="flex" justifyContent="center" mt={2}>
          {!user ? (
            <Button onClick={login}>{t('login')}</Button>
          ) : (
            <Button onClick={logout}>{t('logout')}</Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <CustomThemeProvider>
        <Home />
        <Analytics />
      </CustomThemeProvider>
    </AuthContext.Provider>
  );
};

export default function Page() {
  return (
    <App />
  );
}
