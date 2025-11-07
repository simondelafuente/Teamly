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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  //navega a pantalla de registro
  const handleSignUp = () => {
    Alert.alert('Registro', 'Pantalla de registro próximamente');
  };

  //recuperar contraseña
  const handleForgotPassword = () => {
    Alert.alert('Recuperar Contraseña', 'Funcionalidad próximamente');
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
        <Text style={styles.mainTitle}>Log In</Text>

        {/* Sección de bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </View>

        {/* Campo de Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@example.com"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Campo de Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="**********"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
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
          <Text style={styles.forgotPasswordText}>Forget Password</Text>
        </TouchableOpacity>

        {/* Botón de Login */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Iniciando sesión...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        {/* Botón de Sign Up */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
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
});

export default LoginScreen;

