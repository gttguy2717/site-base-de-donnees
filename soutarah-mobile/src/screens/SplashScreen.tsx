import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';
import { colors, radius, shadows } from '../theme';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.title}>SOUTARAH</Text>
        <Text style={styles.subtitle}>GROUP</Text>
      </Animated.View>
      <Text style={styles.tagline}>Mobilité · Énergie · Immobilier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.darkGreen,
  },
  title: {
    marginTop: 20,
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 12,
    marginTop: 4,
  },
  tagline: {
    position: 'absolute',
    bottom: 60,
    color: colors.white,
    opacity: 0.6,
    fontSize: 13,
    letterSpacing: 1,
  },
});