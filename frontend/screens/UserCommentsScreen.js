import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { getImageWithFallback } from '../utils/imageHelper';

// Componente para mostrar estrellas
const StarRating = ({ rating, size = 20, showNumber = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.starContainer}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color="#FFD700" />
      ))}
      {hasHalfStar && (
        <Ionicons name="star-half" size={size} color="#FFD700" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFD700" />
      ))}
      {showNumber && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const UserCommentsScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params || {};
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      cargarDatos();
    } else {
      Alert.alert('Error', 'No se proporcionó información del usuario');
      navigation.goBack();
    }
  }, [userId]);

  // Refrescar datos cuando la pantalla recibe el foco (al regresar de otra pantalla)
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        cargarDatos();
      }
    }, [userId])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarComentarios(),
        cargarPuntuaciones(),
        cargarPromedio(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarComentarios = async () => {
    try {
      const response = await apiRequest(`/comentarios/usuario/${userId}`);
      if (response.success && Array.isArray(response.data)) {
        // Log para debugging
        if (__DEV__ && response.data.length > 0) {
          console.log('📋 Comentarios cargados:', response.data.length);
          console.log('🔍 Ejemplo de comentario:', {
            id: response.data[0].id_comentario,
            contenido: response.data[0].contenido,
            created_at: response.data[0].created_at
          });
        }
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const cargarPuntuaciones = async () => {
    try {
      const response = await apiRequest(`/puntuaciones/usuario/${userId}`);
      if (response.success && Array.isArray(response.data)) {
        setRatings(response.data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const cargarPromedio = async () => {
    try {
      const response = await apiRequest(`/puntuaciones/usuario/${userId}/promedio`);
      if (response.success && response.data) {
        setAverageRating(parseFloat(response.data.promedio) || 0);
        setTotalRatings(parseInt(response.data.total_puntuaciones) || 0);
      }
    } catch (error) {
      console.error('Error loading average:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  // Combinar comentarios con sus puntuaciones correspondientes
  // La puntuación debe ser del mismo usuario que hizo el comentario, para el mismo usuario comentado
  const getRatingForComment = (commentUserId) => {
    return ratings.find(r => 
      r.id_usuario === commentUserId && r.id_usuario_puntuado === userId
    )?.puntuacion || null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <Text style={styles.headerTitle}>
          Comentarios de {userName || 'Usuario'}
        </Text>
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
            <Text style={styles.loadingText}>Cargando comentarios...</Text>
          </View>
        ) : (
          <>
            {/* Puntuación Promedio */}
            <View style={styles.ratingCard}>
              <Text style={styles.ratingTitle}>Puntuación Promedio</Text>
              <View style={styles.ratingContent}>
                <StarRating rating={averageRating} size={32} showNumber={true} />
                <Text style={styles.ratingCount}>
                  {totalRatings === 0 
                    ? 'Sin puntuaciones aún' 
                    : totalRatings === 1 
                    ? '1 puntuación' 
                    : `${totalRatings} puntuaciones`}
                </Text>
              </View>
            </View>

            {/* Botón para agregar comentario */}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddComment', { 
                userId, 
                userName 
              })}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Agregar Comentario y Puntuación</Text>
            </TouchableOpacity>

            {/* Lista de Comentarios */}
            {comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>
                  No hay comentarios aún
                </Text>
                <Text style={styles.emptySubtext}>
                  Sé el primero en comentar
                </Text>
              </View>
            ) : (
              comments.map((comment) => {
                const rating = getRatingForComment(comment.id_usuario);
                return (
                  <View key={comment.id_comentario} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Image
                        source={{
                          uri: getImageWithFallback(
                            comment.usuario_foto,
                            null,
                            'https://via.placeholder.com/40'
                          ),
                        }}
                        style={styles.userAvatar}
                        defaultSource={require('../assets/images/logo.png')}
                      />
                      <View style={styles.commentUserInfo}>
                        <Text style={styles.commentUserName}>
                          {comment.usuario_nombre || 'Usuario'}
                        </Text>
                        {rating && (
                          <StarRating rating={rating} size={16} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.contenido}</Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.updated_at || comment.created_at)}
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
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
  ratingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
  },
  ratingContent: {
    alignItems: 'center',
  },
  ratingCount: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginLeft: SIZES.margin / 2,
  },
  addButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  commentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.margin / 2,
    backgroundColor: COLORS.inputBackground,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  commentText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default UserCommentsScreen;

