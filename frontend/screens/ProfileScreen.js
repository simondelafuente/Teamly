import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { authService } from '../services/auth';
import { getImageWithFallback } from '../utils/imageHelper';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  // Refrescar datos cuando la pantalla recibe el foco (al regresar de editar perfil)
  useFocusEffect(
    React.useCallback(() => {
      cargarDatosUsuario();
    }, [])
  );

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const data = await authService.getUserData();
      if (data) {
        setUserData(data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🔴 handleLogout llamado');
    
    if (Platform.OS === 'web') {
      // En web, usar modal personalizado
      setShowLogoutModal(true);
    } else {
      // En móvil, usar Alert nativo
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('Usuario canceló el logout');
            },
          },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              await ejecutarLogout();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const ejecutarLogout = async () => {
    console.log('Usuario confirmó el logout, procediendo...');
    try {
      // Cerrar sesión y limpiar datos
      console.log('Llamando a authService.logout()...');
      const logoutSuccess = await authService.logout();
      console.log('Resultado de logout:', logoutSuccess);
      
      // Cerrar modal si está abierto
      setShowLogoutModal(false);
      
      // Navegar a Login y resetear completamente la navegación
      console.log('Navegando a Login...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      console.log('Navegación completada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Aún así, intentar navegar a Login
      try {
        console.log('Intentando navegar a Login después del error...');
        setShowLogoutModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (navError) {
        console.error('❌ Error al navegar a Login:', navError);
        if (Platform.OS === 'web') {
          alert('Error: No se pudo cerrar sesión. Por favor, reinicia la aplicación.');
        } else {
          Alert.alert('Error', 'No se pudo cerrar sesión. Por favor, reinicia la aplicación.');
        }
      }
    }
  };

  const handleMyPublications = async () => {
    if (!userData || !userData.id_usuario) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }
    navigation.navigate('UserPublications', { userId: userData.id_usuario });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Información del Usuario */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: getImageWithFallback(
                userData.foto_perfil,
                null,
                'https://via.placeholder.com/100'
              ),
            }}
            style={styles.profileImage}
            defaultSource={require('../assets/images/logo.png')}
          />
          <Text style={styles.userName}>
            {userData.nombre_completo || 'Usuario'}
          </Text>
        </View>

        {/* Opciones de Menú */}
        <View style={styles.menuSection}>
          {/* Profile */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('EditProfile', { userData });
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="person" size={20} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.menuItemText}>Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('Notificaciones', 'Funcionalidad de notificaciones próximamente');
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="heart-outline" size={20} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.menuItemText}>Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* My Publications */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMyPublications}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="grid-outline" size={20} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.menuItemText}>Mis Publicaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log('🔴 Botón de logout presionado');
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft} pointerEvents="none">
              <View style={styles.menuIconContainer}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>Cerrar Sesión</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmación de logout (para web) */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('Usuario canceló el logout');
                  setShowLogoutModal(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={ejecutarLogout}
              >
                <Text style={styles.modalButtonConfirmText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer de Navegación */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Publications')}
        >
          <Ionicons name="home" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('CreatePublication')}
        >
          <Ionicons name="add-circle" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('MessagesList')}
        >
          <Ionicons name="chatbubble" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonActive]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 2,
  },
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.error,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.primaryBlue,
    marginTop: SIZES.margin,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
    paddingVertical: SIZES.padding * 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.inputBackground,
    marginBottom: SIZES.margin,
    borderWidth: 3,
    borderColor: COLORS.primaryBlue,
  },
  userName: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  menuSection: {
    marginTop: SIZES.margin,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  menuItemText: {
    fontSize: SIZES.large,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  logoutText: {
    color: COLORS.error,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    padding: SIZES.padding / 2,
  },
  footerButtonActive: {
    opacity: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding * 2,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin * 2,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin,
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.inputBackground,
  },
  modalButtonCancelText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.error,
  },
  modalButtonConfirmText: {
    fontSize: SIZES.medium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProfileScreen;

