import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../components/Button';
import { COLORS, SIZES } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenido a Teamly!</Text>
        <Text style={styles.subtitle}>
          Tu aplicación de gestión de equipos
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del Proyecto</Text>
        <Text style={styles.sectionText}>
          El proyecto está configurado y listo para desarrollo.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Comenzar"
          onPress={() => {
            // Agregar navegación aquí cuando tengas más pantallas
            console.log('Comenzar presionado');
          }}
          variant="primary"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  sectionText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: SIZES.margin * 2,
  },
});

export default HomeScreen;

