import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PublicationsScreen from './screens/PublicationsScreen';
import CreatePublicationScreen from './screens/CreatePublicationScreen';
import PublicationDetailScreen from './screens/PublicationDetailScreen';
import UserCommentsScreen from './screens/UserCommentsScreen';
import AddCommentScreen from './screens/AddCommentScreen';
import MessagesScreen from './screens/MessagesScreen';
import MessagesListScreen from './screens/MessagesListScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import UserPublicationsScreen from './screens/UserPublicationsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import GamesNotificationsScreen from './screens/GamesNotificationsScreen';
import SportsNotificationsScreen from './screens/SportsNotificationsScreen';
import RecoverPasswordScreen from './screens/RecoverPasswordScreen';
import SplashScreen from './screens/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './services/auth';

const Stack = createNativeStackNavigator();

 
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

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

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Publications" 
          component={PublicationsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreatePublication" 
          component={CreatePublicationScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="PublicationDetail" 
          component={PublicationDetailScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="UserComments" 
          component={UserCommentsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AddComment" 
          component={AddCommentScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Messages" 
          component={MessagesScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MessagesList" 
          component={MessagesListScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="UserPublications" 
          component={UserPublicationsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="GamesNotifications" 
          component={GamesNotificationsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="SportsNotifications" 
          component={SportsNotificationsScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="RecoverPassword" 
          component={RecoverPasswordScreen}
          options={{ 
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

