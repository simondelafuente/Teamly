import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest, apiConfig } from '../config/api';
import { getImageWithFallback, getImageUrl } from '../utils/imageHelper';
import { Image } from 'react-native';
import { authService } from '../services/auth';

// Función para formatear la fecha y hora del mensaje
function formatMessageDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  if (diffDays === 0) {
    return `Hoy ${time}`;
  } else if (diffDays === 1) {
    return `Ayer ${time}`;
  } else if (diffDays < 7) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${days[date.getDay()]} ${time}`;
  } else {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} ${time}`;
  }
}

const MessagesListScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      
      const userData = await authService.getUserData();
      if (!userData || !userData.id_usuario) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        setMessages([]);
        return;
      }

      const response = await apiRequest(`/mensajes/receptor/${userData.id_usuario}`);

      //MENSAJES EJEMPLO BORRAR DESPUES DE LA DATA ENTRY 
      const mensajesEjemplo = [
        {
          id: 'ejemplo_1',
          remitente: 'Juan Pérez',
          remitente_id: 'ejemplo_juan',
          remitente_foto: getImageUrl('/uploads/avatars/juan_perez.jpg'),
          mensaje: 'Hola! Me interesa unirme a tu publicación de fútbol. ¿Todavía hay vacantes?',
          fecha: new Date().toISOString(),
        },
        {
          id: 'ejemplo_2',
          remitente: 'María García',
          remitente_id: 'ejemplo_maria',
          remitente_foto: getImageUrl('/uploads/avatars/maria_garcia.jpg'),
          mensaje: '¿A qué hora es el partido de básquet? Me gustaría participar.',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
        },
        {
          id: 'ejemplo_3',
          remitente: 'Carlos López',
          remitente_id: 'ejemplo_carlos',
          remitente_foto: getImageUrl('/uploads/avatars/carlos_lopez.jpg'),
          mensaje: 'Perfecto, me apunto al torneo de Rocket League. ¿Dónde nos encontramos?',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
        },
      ];
      
      if (response.success && response.data && response.data.length > 0) {
        const mensajesAgrupados = {};
        
        response.data.forEach((mensaje) => {
          const remitenteId = mensaje.id_emisor;
          
          if (!mensajesAgrupados[remitenteId] || 
              new Date(mensaje.fecha_envio) > new Date(mensajesAgrupados[remitenteId].fecha)) {
            mensajesAgrupados[remitenteId] = {
              id: mensaje.id_mensaje,
              remitente: mensaje.emisor_nombre || 'Usuario',
              remitente_id: mensaje.id_emisor,
              remitente_foto: mensaje.emisor_foto || null,
              mensaje: mensaje.contenido || '',
              fecha: mensaje.fecha_envio,
            };
          }
        });

        // Convertir el objeto agrupado a array y ordenar por fecha
        const mensajesLista = Object.values(mensajesAgrupados).sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        
        // Combinar mensajes reales con los de ejemplo
        const todosLosMensajes = [...mensajesLista, ...mensajesEjemplo];
        
        todosLosMensajes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        setMessages(todosLosMensajes);
      } else {
        // Si no hay mensajes reales, mostrar solo los de ejemplo
        setMessages(mensajesEjemplo);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // En caso de error, mostrar mensajes de ejemplo
      const mensajesEjemplo = [
        {
          id: 'ejemplo_1',
          remitente: 'Juan Pérez',
          remitente_id: 'ejemplo_juan',
          remitente_foto: getImageUrl('/uploads/avatars/juan_perez.jpg'),
          mensaje: 'Hola! Me interesa unirme a tu publicación de fútbol. ¿Todavía hay vacantes?',
          fecha: new Date().toISOString(),
        },
        {
          id: 'ejemplo_2',
          remitente: 'María García',
          remitente_id: 'ejemplo_maria',
          remitente_foto: getImageUrl('/uploads/avatars/maria_garcia.jpg'),
          mensaje: '¿A qué hora es el partido de básquet? Me gustaría participar.',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ejemplo_3',
          remitente: 'Carlos López',
          remitente_id: 'ejemplo_carlos',
          remitente_foto: getImageUrl('/uploads/avatars/carlos_lopez.jpg'),
          mensaje: 'Perfecto, me apunto al torneo de Rocket League. ¿Dónde nos encontramos?',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setMessages(mensajesEjemplo);
    } finally {
      setLoading(false);
    }
  };

  const handleMessagePress = (message) => {
    navigation.navigate('Messages', {
      userId: message.remitente_id,
      userName: message.remitente,
      initialMessage: {
        texto: message.mensaje,
        fecha: message.fecha,
      },
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
        <Text style={styles.headerTitle}>Mensajes Recibidos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              No tienes mensajes
            </Text>
            <Text style={styles.emptySubtext}>
              Los mensajes que recibas aparecerán aquí
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={styles.messageCard}
              onPress={() => handleMessagePress(message)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: getImageWithFallback(
                        message.remitente_foto,
                        null,
                        'https://via.placeholder.com/40'
                      ),
                    }}
                    style={styles.avatarImage}
                    defaultSource={require('../assets/images/logo.png')}
                  />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.remitenteName}>{message.remitente}</Text>
                  <Text style={styles.messageTime}>
                    {formatMessageDateTime(message.fecha)}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </View>
              <Text style={styles.messagePreview} numberOfLines={2}>
                {message.mensaje}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

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
          style={[styles.footerButton, styles.footerButtonActive]}
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
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardHeaderContent: {
    flex: 1,
  },
  remitenteName: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  messageTime: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  messagePreview: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    lineHeight: 20,
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
});

export default MessagesListScreen;

