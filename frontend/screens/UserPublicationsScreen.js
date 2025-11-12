import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { getImageWithFallback } from '../utils/imageHelper';

// Función para formatear la fecha
function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Función para formatear la hora
function formatTime(timeString) {
  if (!timeString) return '';
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return timeString;
}

const UserPublicationsScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publicacionToDelete, setPublicacionToDelete] = useState(null);

  useEffect(() => {
    if (userId) {
      cargarPublicaciones();
    } else {
      Alert.alert('Error', 'No se proporcionó información del usuario');
      navigation.goBack();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        cargarPublicaciones();
      }
    }, [userId])
  );

  const cargarPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/publicaciones/usuario/${userId}`);
      if (response.success && Array.isArray(response.data)) {
        setPublicaciones(response.data);
      } else {
        setPublicaciones([]);
      }
    } catch (error) {
      console.error('Error loading publications:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
      setPublicaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    cargarPublicaciones();
  }, []);

  const handleEliminar = (publicacionId, titulo) => {
    setPublicacionToDelete({ id: publicacionId, titulo });
    
    if (Platform.OS === 'web') {
      setShowDeleteModal(true);
    } else {
      Alert.alert(
        'Eliminar Publicación',
        '¿Estás seguro que deseas eliminar la publicación?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            onPress: () => {
              ejecutarEliminacion(publicacionId);
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const ejecutarEliminacion = async (publicacionId) => {
    try {
      setLoading(true);
      const response = await apiRequest(`/publicaciones/${publicacionId}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        Alert.alert('Éxito', 'Publicación eliminada correctamente');
        cargarPublicaciones();
      } else {
        Alert.alert('Error', response.message || 'No se pudo eliminar la publicación');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo eliminar la publicación');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPublicacionToDelete(null);
    }
  };

  const handleEditar = (publicacion) => {
    navigation.navigate('CreatePublication', {
      mode: 'edit',
      publication: publicacion,
    });
  };

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
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
            <Text style={styles.loadingText}>Cargando publicaciones...</Text>
          </View>
        ) : publicaciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              No tienes publicaciones
            </Text>
            <Text style={styles.emptySubtext}>
              Crea tu primera publicación para comenzar
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreatePublication')}
            >
              <Text style={styles.createButtonText}>Crear Publicación</Text>
            </TouchableOpacity>
          </View>
        ) : (
          publicaciones.map((publicacion) => (
            <View key={publicacion.id_publicacion} style={styles.card}>
              {/* Badge de tipo de actividad */}
              {publicacion.actividad_tipo && (
                <View style={styles.activityTypeBadge}>
                  <Text style={styles.activityTypeText}>
                    {publicacion.actividad_tipo}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={() => {
                  navigation.navigate('PublicationDetail', {
                    publicationId: publicacion.id_publicacion,
                    publication: publicacion,
                  });
                }}
              >
                <Image
                  source={{
                    uri: getImageWithFallback(
                      publicacion.actividad_imagen,
                      publicacion.usuario_foto,
                      'https://via.placeholder.com/75'
                    ),
                  }}
                  style={styles.avatar}
                  defaultSource={require('../assets/images/logo.png')}
                />

                <View style={styles.cardContent}>
                  <Text style={styles.userName} numberOfLines={2} ellipsizeMode="tail">
                    {publicacion.titulo}
                  </Text>
                  <Text style={styles.eventTitle}>
                    {publicacion.nombre_actividad || 'Sin actividad'}
                  </Text>
                  <Text style={styles.eventLocation}>
                    {publicacion.direccion || 'Sin dirección'}
                  </Text>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.primaryBlue} />
                      <Text style={styles.infoText}>
                        {formatDateDisplay(publicacion.fecha)}
                      </Text>
                    </View>
                    {publicacion.hora && (
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.primaryBlue} />
                        <Text style={styles.infoText}>{formatTime(publicacion.hora)}</Text>
                      </View>
                    )}
                    {publicacion.vacantes_disponibles !== undefined && 
                     publicacion.vacantes_disponibles !== null && (
                      <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={16} color={COLORS.primaryBlue} />
                        <Text style={styles.infoText}>
                          {publicacion.vacantes_disponibles === 1
                            ? '1 vacante disponible'
                            : `${publicacion.vacantes_disponibles} vacantes disponibles`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Botones de acción */}
              <View style={styles.actionButtons} pointerEvents="box-none">
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    handleEditar(publicacion);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    handleEliminar(publicacion.id_publicacion, publicacion.titulo);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de confirmación para web */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setPublicacionToDelete(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Publicación</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro que deseas eliminar la publicación?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setPublicacionToDelete(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  if (publicacionToDelete) {
                    ejecutarEliminacion(publicacionToDelete.id);
                  }
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Eliminar</Text>
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
          style={styles.footerButton}
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
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    fontSize: SIZES.large,
    color: COLORS.textDark,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  createButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    marginTop: SIZES.margin * 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardTouchable: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  activityTypeBadge: {
    position: 'absolute',
    top: SIZES.padding / 2,
    right: SIZES.padding / 2,
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding / 4,
    borderRadius: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activityTypeText: {
    color: '#FFFFFF',
    fontSize: SIZES.small - 1,
    fontWeight: '600',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    marginRight: SIZES.margin,
    backgroundColor: COLORS.inputBackground,
  },
  cardContent: {
    flex: 1,
    paddingRight: 80,
  },
  userName: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: SIZES.large,
    color: COLORS.primaryBlue,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.margin / 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.margin,
    marginBottom: 4,
  },
  infoText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginLeft: 4,
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
  actionButtons: {
    flexDirection: 'column',
    marginLeft: SIZES.margin / 2,
    gap: SIZES.margin / 2,
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  editButton: {
    backgroundColor: COLORS.primaryBlue,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadiusLarge || 16,
    padding: SIZES.padding * 1.5,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginBottom: SIZES.margin * 1.5,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin / 2,
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.error || '#FF4444',
  },
  modalButtonCancelText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalButtonConfirmText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UserPublicationsScreen;

