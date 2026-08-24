import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import CartScreen from '../screens/CartScreen';
import MyReservationsScreen from '../screens/MyReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { colors } from '../theme';

export type MainTabsParamList = {
  Home: undefined;
  Vehicles: undefined;
  Cart: undefined;
  Reservations: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Vehicles: ['car-sport', 'car-sport-outline'],
  Cart: ['cart', 'cart-outline'],
  Reservations: ['document-text', 'document-text-outline'],
  Profile: ['person', 'person-outline'],
};

export default function MainTabs() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Pour les administrateurs : afficher directement le dashboard admin avec sidebar
  if (isAdmin) {
    return <AdminDashboardScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const [icon, iconOutline] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          const isCart = route.name === 'Cart';

          return (
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name={focused ? icon : iconOutline}
                size={23}
                color={color}
              />
              {isCart && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Catalogue' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Panier' }} />
      <Tab.Screen name="Reservations" component={MyReservationsScreen} options={{ title: 'Mes devis' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});