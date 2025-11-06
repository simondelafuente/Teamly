import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './services/auth';

const Stack = createNativeStackNavigator();


const SPLASH_SCREEN_DURATION = 9000; // 2000ms = 2 segundos

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mostrar splash screen por el tiempo configurado
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_SCREEN_DURATION);

    checkAuthStatus();

    return () => clearTimeout(splashTimer);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar splash screen mientras se carga o durante el tiempo mínimo
  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false, // Ocultar header para pantalla de login
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Teamly',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

