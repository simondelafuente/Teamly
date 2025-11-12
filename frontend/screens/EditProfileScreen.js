import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../utils/constants';
import { authService } from '../services/auth';
import { apiRequest } from '../config/api';
import { getImageWithFallback } from '../utils/imageHelper';

const getAvatarUrl = (avatarNumber) => {
  const { apiConfig } = require('../config/api');
  const baseUrl = apiConfig.baseURL.replace('/api', '');
  return `${baseUrl}/uploads/avatars/avatar${avatarNumber}.jpg`;
};

const EditProfileScreen = ({ navigation, route }) => {
  const { userData: initialUserData } = route.params || {};
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const data = initialUserData || await authService.getUserData();
      if (data) {
        setUserData(data);
        setNombreCompleto(data.nombre_completo || '');
        setEmail(data.email || '');
        if (data.foto_perfil) {
          setSelectedImage(data.foto_perfil);
        }
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
      navigation.goBack();
    }
  };

  // acceso a galeria
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
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Seleccionar avatar predeterminado
  const selectAvatar = (avatarNumber) => {
    if (avatarNumber === 1) {
      setSelectedImage('/uploads/avatars/avatar1.jpg');
    } else if (avatarNumber === 2) {
      setSelectedImage('/uploads/avatars/avatar2.jpg');
    } else if (avatarNumber === 3) {
      setSelectedImage('/uploads/avatars/avatar3.jpg');
    }
    setShowAvatarModal(false);
  };

  const showImageOptions = () => {
    setShowAvatarModal(true);
  };

  const validarFormulario = () => {
    if (!nombreCompleto.trim()) {
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
    if (!userData || !userData.id_usuario) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return false;
    }
    return true;
  };

  // Guardar cambios
  const guardarCambios = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const { apiConfig } = require('../config/api');
      const url = `${apiConfig.baseURL.replace('/api', '')}/usuarios/${userData.id_usuario}`;

      let response;

      if (selectedImage && selectedImage.startsWith('file://')) {
        const formData = new FormData();
        formData.append('nombre_completo', nombreCompleto.trim());
        formData.append('email', email.trim().toLowerCase());
        
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('foto_perfil', {
          uri: selectedImage,
          name: filename,
          type: type,
        });

        response = await fetch(url, {
          method: 'PUT',
          body: formData,
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textData = await response.text();
          data = textData ? { message: textData } : {};
        }

        if (!response.ok) {
          const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        response = data;
      } else {
        const updateData = {
          nombre_completo: nombreCompleto.trim(),
          email: email.trim().toLowerCase(),
        };

        if (selectedImage) {
          if (selectedImage.startsWith('/uploads/avatars/')) {
            updateData.foto_perfil = selectedImage;
          } else if (!selectedImage.startsWith('file://')) {
            updateData.foto_perfil = selectedImage;
          }
        }

        response = await apiRequest(`/usuarios/${userData.id_usuario}`, {
          method: 'PUT',
          body: updateData,
        });
      }

      if (response.success) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const updatedUserData = {
          ...userData,
          nombre_completo: nombreCompleto.trim(),
          email: email.trim().toLowerCase(),
          foto_perfil: response.data?.foto_perfil || (selectedImage && !selectedImage.startsWith('file://') ? selectedImage : userData.foto_perfil),
        };
        await AsyncStorage.setItem('@teamly:user_data', JSON.stringify(updatedUserData));

        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigation.goBack();
        }, 1200);
      } else {
        throw new Error(response.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Foto de Perfil */}
        <View style={styles.imageSection}>
          <Image
            source={
              selectedImage && selectedImage.includes('avatar1')
                ? { uri: getAvatarUrl(1) }
                : selectedImage && selectedImage.includes('avatar2')
                ? { uri: getAvatarUrl(2) }
                : selectedImage && selectedImage.includes('avatar3')
                ? { uri: getAvatarUrl(3) }
                : selectedImage && selectedImage.startsWith('file://')
                ? { uri: selectedImage }
                : {
                    uri: getImageWithFallback(
                      selectedImage,
                      userData.foto_perfil,
                      'https://via.placeholder.com/100'
                    ),
                  }
            }
            style={styles.profileImage}
            defaultSource={require('../assets/images/logo.png')}
          />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={showImageOptions}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Cambiar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Nombre Completo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor={COLORS.textSecondary}
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
            autoCapitalize="words"
          />
        </View>

        {/* Campo Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>

        {/* Botón Recuperar Contraseña */}
        <TouchableOpacity
          style={styles.recoverPasswordButton}
          onPress={() => navigation.navigate('RecoverPassword')}
        >
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.primaryBlue} />
          <Text style={styles.recoverPasswordText}>Recuperar Contraseña</Text>
        </TouchableOpacity>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={guardarCambios}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Mensaje de éxito breve */}
      {showSuccessMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successMessageText}>✓ Cambios guardados</Text>
        </View>
      )}

      {/* Modal de selección de avatar */}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.padding / 2,
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding * 2,
    paddingBottom: 100,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.inputBackground,
    marginBottom: SIZES.margin,
    borderWidth: 3,
    borderColor: COLORS.primaryBlue,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.borderRadius,
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1.5,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recoverPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    gap: 8,
  },
  recoverPasswordText: {
    color: COLORS.primaryBlue,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.large,
    fontWeight: '600',
  },
  successMessage: {
    position: 'absolute',
    bottom: 100,
    left: SIZES.padding * 2,
    right: SIZES.padding * 2,
    backgroundColor: '#4CAF50',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  successMessageText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
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

export default EditProfileScreen;

