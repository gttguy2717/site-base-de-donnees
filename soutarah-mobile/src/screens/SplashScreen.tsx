import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';
import { colors } from '../theme';

const LOGO = require('../../assets/logo-soutarah.png');

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
        <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.title}>SOUTARAH GROUP</Text>
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
  logoImage: {
    width: 160,
    height: 120,
    marginBottom: 20,
  },
  title: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 4,
  },
  tagline: {
    position: 'absolute',
    bottom: 50,
    color: colors.white,
    opacity: 0.6,
    fontSize: 13,
    letterSpacing: 1,
  },
});