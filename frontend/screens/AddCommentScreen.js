import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Platform as ExpoPlatform } from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { authService } from '../services/auth';

// Componente de estrellas interactivas
const InteractiveStarRating = ({ rating, onRatingChange, size = 40 }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (starValue) => {
    onRatingChange(starValue);
  };

  const displayRating = hoveredRating || rating;

  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <TouchableOpacity
          key={starValue}
          onPress={() => handleStarPress(starValue)}
          onPressIn={() => setHoveredRating(starValue)}
          onPressOut={() => setHoveredRating(0)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={starValue <= displayRating ? 'star' : 'star-outline'}
            size={size}
            color={starValue <= displayRating ? '#FFD700' : '#CCCCCC'}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AddCommentScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params || {};
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [existingComment, setExistingComment] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    cargarUsuarioActual();
  }, []);

  const cargarUsuarioActual = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData && userData.id_usuario) {
        setCurrentUserId(userData.id_usuario);
        // Verificar si ya existe un comentario
        await verificarComentarioExistente(userData.id_usuario);
      } else {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
      navigation.goBack();
    }
  };

  const verificarComentarioExistente = async (idUsuario) => {
    try {
      setCheckingExisting(true);
      console.log('Verificando comentario existente...', { idUsuario, userId });
      const response = await apiRequest(
        `/comentarios/verificar?idUsuario=${idUsuario}&idUsuarioComentado=${userId}`
      );
      console.log('Respuesta verificación comentario:', response);
      if (response.success && response.exists) {
        console.log('Comentario existente encontrado:', response.data);
        setExistingComment(response.data);
        // Cargar el comentario y puntuación existentes
        setComment(response.data.contenido || '');
        // Cargar la puntuación existente
        const ratingResponse = await apiRequest(
          `/puntuaciones/usuario/${userId}`
        );
        console.log('Respuesta puntuaciones:', ratingResponse);
        if (ratingResponse.success && Array.isArray(ratingResponse.data)) {
          const userRating = ratingResponse.data.find(
            (r) => r.id_usuario === idUsuario
          );
          if (userRating) {
            console.log('Puntuación existente encontrada:', userRating.puntuacion);
            setRating(userRating.puntuacion);
          }
        }
      } else {
        console.log('No hay comentario existente');
      }
    } catch (error) {
      console.error('Error checking existing comment:', error);
    } finally {
      setCheckingExisting(false);
      console.log('Verificación completada, checkingExisting = false');
    }
  };

  const validarFormulario = () => {
    console.log('Validando formulario...', { comment: comment.trim(), rating, commentLength: comment.trim().length });
    
    if (!comment.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return false;
    }
    if (comment.trim().length < 5) {
      Alert.alert('Error', 'El comentario debe tener al menos 5 caracteres');
      return false;
    }
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una puntuación');
      return false;
    }
    console.log('Formulario válido');
    return true;
  };

  const enviarComentario = async () => {
    console.log('enviarComentario llamado');
    console.log('Estado actual:', { 
      comment: comment.trim(), 
      rating, 
      currentUserId, 
      existingComment: existingComment ? 'existe' : 'no existe' 
    });
    
    if (!validarFormulario()) {
      console.log('Validación falló');
      return;
    }

    if (!currentUserId) {
      console.log('No hay currentUserId');
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }
    
    console.log('Pasando validaciones, procediendo...');

    // Si ya existe un comentario, mostrar confirmación (solo una)
    if (existingComment) {
      console.log('Mostrando alert de comentario existente');
      if (Platform.OS === 'web') {
        // En web, usar modal personalizado
        setShowConfirmModal(true);
      } else {
        // En móvil, usar Alert nativo
        Alert.alert(
          'Comentario Existente',
          'Ya has comentado a este usuario anteriormente. Si continúas, tu comentario anterior será reemplazado por este nuevo comentario.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => console.log('Usuario canceló'),
            },
            {
              text: 'Reemplazar',
              onPress: () => {
                console.log('Usuario eligió reemplazar, guardando...');
                guardarComentario();
              },
              style: 'destructive',
            },
          ],
          { cancelable: true }
        );
      }
      return;
    }

    // Si no existe, proceder normalmente
    await guardarComentario();
  };

  const guardarComentario = async () => {
    setLoading(true);
    try {
      let commentResponse;
      
      // Si ya existe un comentario, actualizarlo; si no, crearlo
      if (existingComment) {
        console.log('Actualizando comentario existente:', existingComment.id_comentario);
        commentResponse = await apiRequest(`/comentarios/${existingComment.id_comentario}`, {
          method: 'PUT',
          body: {
            contenido: comment.trim(),
          },
        });
        console.log('Respuesta actualización comentario:', commentResponse);
      } else {
        console.log('Creando nuevo comentario');
        commentResponse = await apiRequest('/comentarios', {
          method: 'POST',
          body: {
            contenido: comment.trim(),
            id_usuario: currentUserId,
            id_usuario_comentado: userId,
          },
        });
        console.log('Respuesta creación comentario:', commentResponse);
      }

      // Actualizar o crear puntuación
      console.log('Actualizando/creando puntuación');
      const ratingResponse = await apiRequest('/puntuaciones/create-or-update', {
        method: 'POST',
        body: {
          id_usuario: currentUserId,
          id_usuario_puntuado: userId,
          puntuacion: rating,
        },
      });
      console.log('Respuesta puntuación:', ratingResponse);

      // Verificar respuestas
      if (!commentResponse) {
        throw new Error('No se recibió respuesta del servidor para el comentario');
      }
      
      if (!ratingResponse) {
        throw new Error('No se recibió respuesta del servidor para la puntuación');
      }

      // Algunos endpoints pueden no devolver success explícitamente
      const commentSuccess = commentResponse.success !== false;
      const ratingSuccess = ratingResponse.success !== false;

      if (commentSuccess && ratingSuccess) {
        // Mostrar mensaje de éxito y navegar automáticamente
        Alert.alert(
          '¡Éxito!',
          existingComment 
            ? 'Tu comentario y puntuación han sido actualizados correctamente'
            : 'Tu comentario y puntuación han sido guardados correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('UserComments', { 
                  userId, 
                  userName 
                });
              },
            },
          ],
          { cancelable: false }
        );
        
        // Navegar automáticamente después de 1.5 segundos
        setTimeout(() => {
          navigation.navigate('UserComments', { 
            userId, 
            userName 
          });
        }, 1500);
      } else {
        const errorMsg = commentResponse.message || ratingResponse.message || 'Error al guardar el comentario o la puntuación';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar el comentario. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
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
          Comentar a {userName || 'Usuario'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerta si ya existe un comentario */}
        {existingComment && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <Text style={styles.warningText}>
              Ya has comentado a este usuario anteriormente. Tu comentario anterior será reemplazado si guardas uno nuevo.
            </Text>
          </View>
        )}

        {/* Puntuación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Puntuación</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona cuántas estrellas le das
          </Text>
          <InteractiveStarRating
            rating={rating}
            onRatingChange={setRating}
            size={50}
          />
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1
                ? '1 estrella'
                : `${rating} estrellas`}
            </Text>
          )}
        </View>

        {/* Comentario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentario</Text>
          <Text style={styles.sectionSubtitle}>
            Comparte tu experiencia con este usuario
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu comentario aquí..."
            placeholderTextColor={COLORS.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {comment.length}/500 caracteres
          </Text>
        </View>

        {/* Botón Enviar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || checkingExisting) && styles.submitButtonDisabled,
          ]}
          onPress={() => {
            console.log('Botón presionado - enviarComentario');
            console.log('Estados:', { loading, checkingExisting, currentUserId, comment: comment.trim(), rating });
            enviarComentario();
          }}
          disabled={loading || checkingExisting}
        >
          {loading || checkingExisting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Enviar Comentario</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmación para web */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comentario Existente</Text>
            <Text style={styles.modalMessage}>
              Ya has comentado a este usuario anteriormente. Si continúas, tu comentario anterior será reemplazado por este nuevo comentario.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('Usuario canceló');
                  setShowConfirmModal(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  console.log('Usuario eligió reemplazar, guardando...');
                  setShowConfirmModal(false);
                  guardarComentario();
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Reemplazar</Text>
              </TouchableOpacity>
            </View>
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
  section: {
    marginBottom: SIZES.margin * 2,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
  },
  sectionSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.margin,
    gap: 8,
  },
  star: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: SIZES.medium,
    color: COLORS.primaryBlue,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SIZES.margin / 2,
  },
  commentInput: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SIZES.margin / 2,
  },
  submitButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.large,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.medium,
    color: '#8B4513',
    marginLeft: SIZES.margin / 2,
    lineHeight: 20,
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
    borderRadius: SIZES.borderRadiusLarge,
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
    backgroundColor: COLORS.error,
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

export default AddCommentScreen;

