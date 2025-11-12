import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { authService } from '../services/auth';

const MessagesScreen = ({ route, navigation }) => {
  const { userId, userName, initialMessage } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (userId) {
      cargarMensajes();
    } else {
      Alert.alert('Error', 'No se proporcionó información del usuario');
      navigation.goBack();
    }
  }, [userId]);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      
      const userData = await authService.getUserData();
      if (!userData || !userData.id_usuario) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        setMessages([]);
        return;
      }

      const response = await apiRequest(`/mensajes/conversacion/${userData.id_usuario}/${userId}`);
      
      if (response.success && response.data) {
        const mensajesMapeados = response.data.map((mensaje) => {
          const isSent = mensaje.id_emisor === userData.id_usuario;
          const fechaISO = mensaje.fecha_envio;
          const fechaFormateada = fechaISO 
            ? formatMessageDateFromString(fechaISO)
            : formatMessageDate();
          
          return {
            id: mensaje.id_mensaje,
            texto: mensaje.contenido || '',
            fecha: fechaFormateada,
            isSent: isSent,
            isPending: false,
          };
        });
        
        setMessages(mensajesMapeados);
        
        if (mensajesMapeados.length > 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        if (initialMessage) {
          const messageDate = initialMessage.fecha 
            ? formatMessageDateFromString(initialMessage.fecha)
            : formatMessageDate();
          
          setMessages([{
            id: `received_${Date.now()}`,
            texto: initialMessage.texto,
            fecha: messageDate,
            isSent: false,
            isPending: false,
          }]);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (initialMessage) {
        const messageDate = initialMessage.fecha 
          ? formatMessageDateFromString(initialMessage.fecha)
          : formatMessageDate();
        
        setMessages([{
          id: `received_${Date.now()}`,
          texto: initialMessage.texto,
          fecha: messageDate,
          isSent: false,
          isPending: false,
        }]);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los mensajes');
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatMessageDateFromString = (dateString) => {
    if (!dateString) return formatMessageDate();
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return formatMessageDate();
    }
  };

  const formatMessageDate = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const enviarMensaje = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const messageText = newMessage.trim();
  
    const userData = await authService.getUserData();
    if (!userData || !userData.id_usuario) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const tempMessage = {
      id: `temp_${Date.now()}`,
      texto: messageText,
      fecha: formatMessageDate(),
      isSent: true,
      isPending: true,
    };

    try {
      setSending(true);
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const response = await apiRequest('/mensajes', {
        method: 'POST',
        body: {
          id_emisor: userData.id_usuario,
          id_receptor: userId,
          contenido: messageText,
        },
      });

      if (response.success && response.data) {
        const fechaISO = response.data.fecha_envio;
        const fechaFormateada = fechaISO 
          ? formatMessageDateFromString(fechaISO)
          : formatMessageDate();
        
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === tempMessage.id
              ? {
                  id: response.data.id_mensaje,
                  texto: response.data.contenido,
                  fecha: fechaFormateada,
                  isSent: true,
                  isPending: false,
                }
              : msg
          )
        );
      } else {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === tempMessage.id
              ? { ...msg, isPending: false }
              : msg
          )
        );
      }
      
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== tempMessage.id)
      );
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
        <Text style={styles.headerTitle}>
          Mensajes con {userName || 'Usuario'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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
              No hay mensajes disponibles
            </Text>
            <Text style={styles.emptySubtext}>
              Esta funcionalidad estará disponible próximamente
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View 
              key={message.id || `msg_${message.fecha}_${message.texto}`} 
              style={[
                styles.messageCard,
                message.isSent ? styles.messageSent : styles.messageReceived
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isSent && styles.messageTextSent
              ]}>
                {message.texto}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageDate,
                  message.isSent && styles.messageDateSent
                ]}>
                  {message.fecha}
                </Text>
                {message.isPending && (
                  <Ionicons 
                    name="time-outline" 
                    size={12} 
                    color={message.isSent ? 'rgba(255,255,255,0.7)' : COLORS.textSecondary}
                    style={styles.pendingIcon}
                  />
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={COLORS.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={enviarMensaje}
          disabled={sending || !newMessage.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={newMessage.trim() ? "#FFFFFF" : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    maxWidth: '80%',
  },
  messageSent: {
    backgroundColor: COLORS.primaryBlue,
    alignSelf: 'flex-end',
  },
  messageReceived: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
  },
  messageTextSent: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  messageDateSent: {
    color: 'rgba(255,255,255,0.8)',
  },
  pendingIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    maxHeight: 100,
    marginRight: SIZES.margin / 2,
  },
  sendButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
});

export default MessagesScreen;

