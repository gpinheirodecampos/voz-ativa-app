import { Provider } from 'react-redux';
import { PaperProvider, MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';
import store from './redux/store';
import { useEffect } from 'react';
import { loadUserFromToken } from './redux/authSlice';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, TextStyle } from 'react-native';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Define font configuration
const fontConfig = {
  fontFamily: 'Inter',
  fonts: {
    regular: {
      fontFamily: 'Inter',
      fontWeight: 'normal' as TextStyle['fontWeight'],
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: '500' as TextStyle['fontWeight'],
    },
    light: {
      fontFamily: 'Inter-Light',
      fontWeight: '300' as TextStyle['fontWeight'],
    },
    thin: {
      fontFamily: 'Inter-Light',
      fontWeight: '300' as TextStyle['fontWeight'],
    },
    bold: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },
  },
};

// Configuração personalizada do tema
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#006400', // Verde escuro
    secondary: '#f57c00', // Laranja para alertas
    background: '#f5f5f5',
    surface: '#ffffff',
  },
  fonts: configureFonts({config: fontConfig}),
};

// Setup do cliente axios
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Interceptor para incluir token em todas as requisições
axios.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function RootLayout() {
  // Load all the fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Light': require('../assets/fonts/Inter_18pt-Light.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
  });
  
  // Carrega o usuário do token ao iniciar a aplicação
  useEffect(() => {
    store.dispatch(loadUserFromToken());
  }, []);

  // Hide the splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show nothing until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <Slot />
      </PaperProvider>
    </Provider>
  );
}
