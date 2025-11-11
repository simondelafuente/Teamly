import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';

const NotificationsScreen = ({ navigation }) => {
  const [messagesEnabled, setMessagesEnabled] = useState(true);

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
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Messages Option */}
        <TouchableOpacity style={styles.optionItem} activeOpacity={0.7}>
          <Text style={styles.optionText}>Mensajes</Text>
          <Switch
            value={messagesEnabled}
            onValueChange={setMessagesEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryBlue }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </TouchableOpacity>

        {/* Games Option */}
        <TouchableOpacity
          style={styles.optionItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('GamesNotifications')}
        >
          <Text style={styles.optionText}>Videojuegos</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primaryBlue} />
        </TouchableOpacity>

        {/* Sports Option */}
        <TouchableOpacity
          style={styles.optionItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SportsNotifications')}
        >
          <Text style={styles.optionText}>Deportes</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primaryBlue} />
        </TouchableOpacity>
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
  },
  optionText: {
    fontSize: SIZES.large,
    fontWeight: '500',
    color: COLORS.textDark,
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

export default NotificationsScreen;

