import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { authService } from '../services/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Limpiar mensajes de error anteriores
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setErrorMessage('');
        navigation.replace('Home');
      }
    } catch (error) {
      // Mostrar mensaje de error específico
      if (error.message && (error.message.includes('incorrectos') || error.message.includes('incorrect'))) {
        setErrorMessage('Email o contraseña incorrectos');
      } else {
        setErrorMessage(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  //navega a pantalla de registro
  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  //recuperar contraseña
  const handleForgotPassword = () => {
    navigation.navigate('RecoverPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título principal */}
        <Text style={styles.mainTitle}>Iniciar Sesión</Text>

        {/* Sección de bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeText}>
            Ingresa tus credenciales para acceder a tu cuenta y comenzar a disfrutar de todas las funcionalidades.
          </Text>
        </View>

        {/* Campo de Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@ejemplo.com"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(''); // Limpiar error al escribir
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Campo de Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="**********"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(''); // Limpiar error al escribir
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#666666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Link de olvidar contraseña */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Mensaje de error */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Botón de Login */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        {/* Botón de Sign Up */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SIZES.padding * 2,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
  },
  welcomeSection: {
    marginBottom: SIZES.margin * 3,
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: SIZES.margin,
  },
  welcomeText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1.5,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    minHeight: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    minHeight: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    paddingVertical: SIZES.padding,
  },
  eyeIcon: {
    padding: SIZES.padding / 2,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SIZES.margin * 2,
  },
  forgotPasswordText: {
    fontSize: SIZES.medium,
    color: COLORS.primaryBlue,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 16,
    paddingVertical: SIZES.padding + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signUpButton: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingVertical: SIZES.padding + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  signUpButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
});

export default LoginScreen;

