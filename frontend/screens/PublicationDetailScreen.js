import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { getImageWithFallback } from '../utils/imageHelper';

// Función para formatear la fecha para mostrar
function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${dayName}, ${day} de ${month}`;
}

// Función para formatear la hora
function formatTime(timeString) {
  if (!timeString) return '';
  // Si viene en formato HH:MM:SS, solo tomar HH:MM
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes} ${period}`;
  }
  return timeString;
}

// Función para obtener el rango de tiempo (asumiendo 30 minutos por defecto)
function getTimeRange(timeString) {
  if (!timeString) return '';
  // Calcular hora de inicio y fin
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    let startHours = parseInt(parts[0]);
    let startMinutes = parseInt(parts[1]);
    
    // Formatear hora de inicio
    const startPeriod = startHours >= 12 ? 'PM' : 'AM';
    const displayStartHours = startHours > 12 ? startHours - 12 : startHours === 0 ? 12 : startHours;
    const formattedStart = `${displayStartHours}:${String(startMinutes).padStart(2, '0')} ${startPeriod}`;
    
    // Calcular hora de fin (30 minutos después)
    let endHours = startHours;
    let endMinutes = startMinutes + 30;
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    // Formatear hora de fin
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const displayEndHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    const formattedEnd = `${displayEndHours}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
    
    return `${formattedStart} - ${formattedEnd}`;
  }
  return formatTime(timeString);
}

const PublicationDetailScreen = ({ route, navigation }) => {
  const { publicationId, publication } = route.params || {};
  const [publicacionData, setPublicacionData] = useState(publication || null);
  const [loading, setLoading] = useState(!publication);

  useEffect(() => {
    if (!publication && publicationId) {
      cargarPublicacion();
    }
  }, [publicationId]);

  const cargarPublicacion = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/publicaciones/${publicationId}`);
      if (response.success && response.data) {
        setPublicacionData(response.data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la publicación');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading publication:', error);
      Alert.alert('Error', 'No se pudo cargar la publicación');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleComments = () => {
    if (!publicacionData || !publicacionData.id_usuario) {
      Alert.alert('Error', 'No se puede acceder a los comentarios');
      return;
    }
    // Navegar a comentarios del usuario creador
    navigation.navigate('UserComments', { 
      userId: publicacionData.id_usuario,
      userName: publicacionData.usuario_nombre || 'Usuario'
    });
  };

  const handleMessages = () => {
    if (!publicacionData || !publicacionData.id_usuario) {
      Alert.alert('Error', 'No se puede acceder a los mensajes');
      return;
    }
    // Navegar a mensajes con el usuario creador
    navigation.navigate('Messages', { 
      userId: publicacionData.id_usuario,
      userName: publicacionData.usuario_nombre || 'Usuario'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Cargando publicación...</Text>
      </View>
    );
  }

  if (!publicacionData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la publicación</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Construir URL de imagen
  const imageUri = getImageWithFallback(
    publicacionData.actividad_imagen,
    publicacionData.usuario_foto,
    'https://via.placeholder.com/300'
  );

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
        <Text style={styles.headerTitle}>
          {publicacionData.titulo || 'Detalle de Publicación'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Publication Details Card */}
        <View style={styles.detailsCard}>
          {/* Event Image */}
          <Image
            source={{ uri: imageUri }}
            style={styles.eventImage}
            defaultSource={require('../assets/images/logo.png')}
            resizeMode="cover"
          />

          {/* Event Information */}
          <View style={styles.infoSection}>
            {/* Date */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <View style={styles.infoPill}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primaryBlue} />
                <Text style={styles.infoPillText}>
                  {formatDateDisplay(publicacionData.fecha)}
                </Text>
              </View>
            </View>

            {/* Schedule */}
            {publicacionData.hora && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Horario:</Text>
                <View style={styles.infoPill}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primaryBlue} />
                  <Text style={styles.infoPillText}>
                    {formatTime(publicacionData.hora)}
                  </Text>
                </View>
              </View>
            )}

            {/* Address */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>
                {publicacionData.direccion || 'Sin dirección'}
              </Text>
            </View>

            {/* Zone */}
            {publicacionData.zona && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Zona:</Text>
                <Text style={styles.infoValue}>
                  {publicacionData.zona}
                </Text>
              </View>
            )}

            {/* Available Spots */}
            {publicacionData.vacantes_disponibles !== undefined && 
             publicacionData.vacantes_disponibles !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vacantes Disponibles:</Text>
                <Text style={styles.infoValue}>
                  {publicacionData.vacantes_disponibles === 1
                    ? '1 vacante disponible'
                    : `${publicacionData.vacantes_disponibles} vacantes disponibles`}
                </Text>
              </View>
            )}

            {/* Activity Name */}
            {publicacionData.nombre_actividad && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Actividad:</Text>
                <Text style={styles.infoValue}>
                  {publicacionData.nombre_actividad}
                </Text>
              </View>
            )}

            {/* Host */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Anfitrión:</Text>
              <Text style={styles.infoValue}>
                {publicacionData.usuario_nombre || 'Usuario desconocido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleComments}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Comentarios</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleMessages}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mensajes con el Creador</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Navigation Bar */}
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
  },
  backButton: {
    padding: SIZES.padding / 2,
  },
  headerTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
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
    paddingBottom: 100, // Espacio para el footer
  },
  detailsCard: {
    backgroundColor: '#E8F4FD', // Light blue background
    borderRadius: SIZES.borderRadiusLarge,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.margin,
    backgroundColor: COLORS.inputBackground,
  },
  infoSection: {
    gap: SIZES.margin,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: SIZES.margin / 2,
    minWidth: 100,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8E0F5', // Lighter blue for pills
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: 20,
    gap: 6,
  },
  infoPillText: {
    fontSize: SIZES.medium,
    color: COLORS.primaryBlue,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    flex: 1,
  },
  actionsContainer: {
    gap: SIZES.margin,
    marginTop: SIZES.margin,
  },
  actionButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.large,
    fontWeight: '600',
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
});

export default PublicationDetailScreen;

