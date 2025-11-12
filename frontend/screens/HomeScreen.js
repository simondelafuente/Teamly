import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.replace('Publications');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;

