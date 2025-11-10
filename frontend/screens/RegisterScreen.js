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
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../utils/constants';
import { authService } from '../services/auth';
import { getImageWithFallback } from '../utils/imageHelper';

// Opciones de pregunta de seguridad
const SECURITY_QUESTIONS = [
  '¿Cual es el nombre de tu primer mascota?',
  '¿A cual colegio fuiste de niño?',
  '¿Cual es tu videojuego favorito?',
];

// URLs de avatares en el servidor
const getAvatarUrl = (avatarNumber) => {
  const { apiConfig } = require('../config/api');
  const baseUrl = apiConfig.baseURL.replace('/api', '');
  return `${baseUrl}/uploads/avatars/avatar${avatarNumber}.jpg`;
};

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Solicitar permisos para acceder a la galería
  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos para acceder a la galería de fotos.'
      );
      return false;
    }
    return true;
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowAvatarModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos para acceder a la cámara.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowAvatarModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Seleccionar avatar predeterminado
  const selectAvatar = (avatarNumber) => {
    // Guardar la ruta del avatar que estará en el servidor
    if (avatarNumber === 1) {
      setSelectedImage('/uploads/avatars/avatar1.jpg');
    } else if (avatarNumber === 2) {
      setSelectedImage('/uploads/avatars/avatar2.jpg');
    } else if (avatarNumber === 3) {
      setSelectedImage('/uploads/avatars/avatar3.jpg');
    }
    setShowAvatarModal(false);
  };

  // Mostrar modal de selección de foto
  const showImageOptions = () => {
    setShowAvatarModal(true);
  };

  // Validar formulario
  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (!securityQuestion) {
      Alert.alert('Error', 'Por favor selecciona una pregunta de seguridad');
      return false;
    }
    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Por favor ingresa la respuesta de seguridad');
      return false;
    }
    return true;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Preparar datos para el registro
      const userData = {
        nombre_completo: fullName.trim(),
        email: email.trim().toLowerCase(),
        contrasena: password,
        pregunta_seguridad: securityQuestion,
        respuesta_seguridad: securityAnswer.trim(),
        foto_perfil: null,
      };

      // Determinar si hay imagen para subir o es un avatar predeterminado
      let imageUri = null;
      if (selectedImage && typeof selectedImage === 'string') {
        if (selectedImage.startsWith('/uploads/avatars/')) {
          // Es un avatar del servidor, usar la ruta directamente
          userData.foto_perfil = selectedImage;
        } else if (selectedImage.startsWith('file://')) {
          // Es una imagen seleccionada del dispositivo, subirla
          imageUri = selectedImage;
        }
      }

      const response = await authService.register(userData, imageUri);
      if (response.success) {
        // Limpiar el formulario
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSecurityQuestion('');
        setSecurityAnswer('');
        setSelectedImage(null);
        
        // Mostrar mensaje de éxito y navegar automáticamente a Login
        Alert.alert(
          'Éxito',
          'Cuenta creada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ],
          { cancelable: false }
        );
        
        // Navegar automáticamente después de 1.5 segundos (incluso si no presiona OK)
        setTimeout(() => {
          navigation.replace('Login');
        }, 1500);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.mainTitle}>New Account</Text>

        {/* Avatar/Imagen de perfil */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setShowAvatarModal(true)}
        >
          {selectedImage ? (
            <Image
              source={
                selectedImage && selectedImage.includes('avatar1')
                  ? { uri: getAvatarUrl(1) }
                  : selectedImage && selectedImage.includes('avatar2')
                  ? { uri: getAvatarUrl(2) }
                  : selectedImage && selectedImage.includes('avatar3')
                  ? { uri: getAvatarUrl(3) }
                  : typeof selectedImage === 'string' && selectedImage.startsWith('file://')
                  ? { uri: selectedImage }
                  : typeof selectedImage === 'string'
                  ? { uri: getImageWithFallback(selectedImage, null, 'https://via.placeholder.com/100') }
                  : selectedImage
              }
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={40} color="#666666" />
            </View>
          )}
        </TouchableOpacity>

        {/* Campo de Nombre Completo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="pedro gonzalez"
            placeholderTextColor="#8E8E93"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Campo de Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
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
              placeholder="************"
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

        {/* Campo de Confirmar Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="************"
              placeholderTextColor="#8E8E93"
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
                color="#666666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo de Pregunta de Seguridad (Dropdown) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Security Question</Text>
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
              {securityQuestion || 'name of your first pet'}
            </Text>
            <Ionicons
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666666"
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
          <Text style={styles.label}>Security Answer</Text>
          <TextInput
            style={styles.input}
            placeholder="scooby"
            placeholderTextColor="#8E8E93"
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            autoCapitalize="none"
          />
        </View>

        {/* Términos y Privacidad */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to{' '}
            <Text style={styles.termsLink}>Terms of Use</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Botón de Sign Up */}
        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Creando cuenta...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Link de Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para seleccionar avatar */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Foto de Perfil</Text>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Avatares disponibles */}
            <View style={styles.avatarsContainer}>
              <TouchableOpacity
                style={[
                  styles.avatarOption,
                  selectedImage && selectedImage.includes('avatar1') && styles.avatarSelected,
                ]}
                onPress={() => selectAvatar(1)}
              >
                <Image 
                  source={{ uri: getAvatarUrl(1) }} 
                  style={styles.avatarPreview}
                  defaultSource={require('../assets/images/logo.png')}
                />
                <Text style={styles.avatarLabel}>Avatar 1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.avatarOption,
                  selectedImage && selectedImage.includes('avatar2') && styles.avatarSelected,
                ]}
                onPress={() => selectAvatar(2)}
              >
                <Image 
                  source={{ uri: getAvatarUrl(2) }} 
                  style={styles.avatarPreview}
                  defaultSource={require('../assets/images/logo.png')}
                />
                <Text style={styles.avatarLabel}>Avatar 2</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.avatarOption,
                  selectedImage && selectedImage.includes('avatar3') && styles.avatarSelected,
                ]}
                onPress={() => selectAvatar(3)}
              >
                <Image 
                  source={{ uri: getAvatarUrl(3) }} 
                  style={styles.avatarPreview}
                  defaultSource={require('../assets/images/logo.png')}
                />
                <Text style={styles.avatarLabel}>Avatar 3</Text>
              </TouchableOpacity>
            </View>

            {/* Botón para cargar foto desde dispositivo */}
            <TouchableOpacity
              style={styles.loadPhotoButton}
              onPress={() => {
                setShowAvatarModal(false);
                Alert.alert(
                  'Cargar Foto',
                  'Elige una opción',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Galería',
                      onPress: pickImage,
                    },
                    {
                      text: 'Cámara',
                      onPress: takePhoto,
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.loadPhotoButtonText}>Cargar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: SIZES.margin * 2,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.inputBackground,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1.5,
    zIndex: 1,
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#8E8E93',
  },
  dropdownList: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  termsContainer: {
    marginBottom: SIZES.margin * 2,
    alignItems: 'center',
  },
  termsText: {
    fontSize: SIZES.small,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.primaryBlue,
    fontWeight: '500',
  },
  signUpButton: {
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
  signUpButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  loginLink: {
    fontSize: SIZES.medium,
    color: COLORS.primaryBlue,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.padding * 2,
    paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding * 2,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  modalTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: SIZES.padding / 2,
  },
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.margin * 2,
    flexWrap: 'wrap',
    gap: SIZES.margin,
  },
  avatarOption: {
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  avatarSelected: {
    borderColor: COLORS.primaryBlue,
    backgroundColor: '#E8F4FD',
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SIZES.margin / 2,
  },
  avatarLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  loadPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    gap: 8,
    marginTop: SIZES.margin,
  },
  loadPhotoButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.large,
    fontWeight: '600',
  },
});

export default RegisterScreen;

