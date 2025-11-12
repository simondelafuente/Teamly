import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { getImageUrl } from '../utils/imageHelper';

const GamesNotificationsScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    cargarVideojuegos();
  }, []);

  const cargarVideojuegos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/actividades/tipo/Videojuego');
      
      if (response.success && response.data) {
        setGames(response.data);
        const initialNotifications = {};
        response.data.forEach(game => {
          initialNotifications[game.id_actividad] = false;
        });
        setNotifications(initialNotifications);
      }
    } catch (error) {
      console.error('Error al cargar videojuegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (gameId) => {
    setNotifications(prev => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Videojuegos</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
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
        <Text style={styles.headerTitle}>Videojuegos</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="game-controller-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay videojuegos disponibles</Text>
          </View>
        ) : (
          games.map((game) => (
            <View key={game.id_actividad} style={styles.gameItem}>
              <View style={styles.gameItemLeft}>
                {game.imagen && (
                  <Image
                    source={{ uri: getImageUrl(game.imagen) }}
                    style={styles.gameImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.gameText}>{game.nombre_actividad}</Text>
              </View>
              <Switch
                value={notifications[game.id_actividad] || false}
                onValueChange={() => toggleNotification(game.id_actividad)}
                trackColor={{ false: COLORS.border, true: COLORS.primaryBlue }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              />
            </View>
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
  },
  gameItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gameImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.margin,
  },
  gameText: {
    fontSize: SIZES.large,
    fontWeight: '500',
    color: COLORS.textDark,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
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

export default GamesNotificationsScreen;

