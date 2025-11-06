import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

let logoImage;
try {
  logoImage = require('../assets/images/logo.png');
} catch (e) {
  try {
    logoImage = require('../assets/images/logo.jpg');
  } catch (e2) {
    logoImage = null;
  }
}

export default function SplashScreen() {
  const hasLogo = logoImage !== null;

  return (
    <View style={styles.container}>
      {hasLogo ? (
        <Image 
          source={logoImage} 
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.iconContainer}>
          <Text style={styles.placeholderText}>
            📁 Coloca logo.png en frontend/assets/images/
          </Text>
        </View>
      )}
      
      {/* Tagline */}
      <Text style={styles.tagline}>Tu Próxima Actividad Comienza Aquí.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: '#1E90FF',
    marginBottom: 60,
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 18,
    color: '#1E90FF',
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '400',
  },
});

