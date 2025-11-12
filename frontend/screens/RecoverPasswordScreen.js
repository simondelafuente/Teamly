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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';

const SECURITY_QUESTIONS = [
  '¿Cual es el nombre de tu primer mascota?',
  '¿A cual colegio fuiste de niño?',
  '¿Cual es tu videojuego favorito?',
];

const RecoverPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleVerify = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu email');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Por favor ingresa un email válido');
      return;
    }
    if (!securityQuestion) {
      setErrorMessage('Por favor selecciona una pregunta de seguridad');
      return;
    }
    if (!securityAnswer.trim()) {
      setErrorMessage('Por favor ingresa la respuesta de seguridad');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/usuarios/verify-security', {
        method: 'POST',
        body: {
          email: email.trim().toLowerCase(),
          pregunta_seguridad: securityQuestion,
          respuesta_seguridad: securityAnswer.trim(),
        },
      });

      if (response.success) {
        setVerifiedEmail(email.trim().toLowerCase());
        setErrorMessage('');
        setStep(2);
      } else {
        if (response.message && response.message.includes('no encontrado')) {
          setErrorMessage('El email ingresado no está registrado');
        } else if (response.message && response.message.includes('incorrectas')) {
          setErrorMessage('La pregunta o respuesta de seguridad es incorrecta');
        } else {
          setErrorMessage(response.message || 'Credenciales incorrectas');
        }
      }
    } catch (error) {
      if (error.status === 404 || (error.message && error.message.includes('no encontrado'))) {
        setErrorMessage('El email ingresado no está registrado');
      } else if (error.status === 401 || (error.message && error.message.includes('incorrectas'))) {
        setErrorMessage('La pregunta o respuesta de seguridad es incorrecta');
      } else {
        setErrorMessage(error.message || 'Error al verificar las credenciales. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!newPassword.trim()) {
      setErrorMessage('Por favor ingresa una nueva contraseña');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/usuarios/reset-password', {
        method: 'PUT',
        body: {
          email: verifiedEmail,
          nueva_contrasena: newPassword,
        },
      });

      if (response.success) {
        setShowSuccessMessage(true);
        setErrorMessage('');
        
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 1500);
      } else {
        setErrorMessage(response.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al actualizar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <>
            {/* Texto introductorio */}
            <Text style={styles.introText}>
              Ingresa tu email y responde tu pregunta de seguridad para recuperar tu contraseña.
            </Text>

            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="usuario@ejemplo.com"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo de Pregunta de Seguridad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Elige tu Pregunta de Seguridad</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !securityQuestion && styles.dropdownPlaceholder,
                  ]}
                >
                  {securityQuestion || 'nombre de tu primera mascota'}
                </Text>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.primaryBlue}
                />
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownList}>
                  {SECURITY_QUESTIONS.map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSecurityQuestion(question);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Campo de Respuesta de Seguridad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Introduce la Respuesta de Seguridad</Text>
              <TextInput
                style={styles.input}
                placeholder="scooby"
                placeholderTextColor={COLORS.textSecondary}
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Mensaje de error */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Botón Continuar */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continuar</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Texto introductorio */}
            <Text style={styles.introText}>
              Ingresa tu nueva contraseña.
            </Text>

            {/* Campo de Nueva Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="************"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
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
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo de Confirmar Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="************"
                  placeholderTextColor={COLORS.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mensaje de error */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Botón Crear Nueva Contraseña */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Crear Nueva Contraseña</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <View style={styles.successMessage}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.successMessageText}>
            ✓ Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.padding / 2,
  },
  headerTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  introText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin * 2,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1.5,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SIZES.padding / 2,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.borderRadius,
    paddingRight: SIZES.padding,
  },
  passwordInput: {
    flex: 1,
    padding: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: SIZES.padding / 2,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
  },
  dropdownText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
  },
  dropdownList: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.padding / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  button: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin,
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: SIZES.large,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
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
  successMessage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 1.5,
    gap: 10,
  },
  successMessageText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});

export default RecoverPasswordScreen;

