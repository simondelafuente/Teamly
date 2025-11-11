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

const SportsNotificationsScreen = ({ navigation }) => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    cargarDeportes();
  }, []);

  const cargarDeportes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/actividades/tipo/Deporte');
      
      if (response.success && response.data) {
        setSports(response.data);
        // Inicializar todas las notificaciones como desactivadas
        const initialNotifications = {};
        response.data.forEach(sport => {
          initialNotifications[sport.id_actividad] = false;
        });
        setNotifications(initialNotifications);
      }
    } catch (error) {
      console.error('Error al cargar deportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (sportId) => {
    setNotifications(prev => ({
      ...prev,
      [sportId]: !prev[sportId]
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
          <Text style={styles.headerTitle}>Deportes</Text>
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
        <Text style={styles.headerTitle}>Deportes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay deportes disponibles</Text>
          </View>
        ) : (
          sports.map((sport) => (
            <View key={sport.id_actividad} style={styles.sportItem}>
              <View style={styles.sportItemLeft}>
                {sport.imagen && (
                  <Image
                    source={{ uri: getImageUrl(sport.imagen) }}
                    style={styles.sportImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.sportText}>{sport.nombre_actividad}</Text>
              </View>
              <Switch
                value={notifications[sport.id_actividad] || false}
                onValueChange={() => toggleNotification(sport.id_actividad)}
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
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
  },
  sportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.margin,
  },
  sportText: {
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

export default SportsNotificationsScreen;

