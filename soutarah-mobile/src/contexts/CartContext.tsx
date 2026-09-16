import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { BuildQuotePayload, LastOrder, ValidateQuoteResult } from '../types';

export interface CartItemProduct {
  id: string;
  nom?: string;
  name?: string;
  reference?: string;
  image_url?: string | null;
  prix_unitaire?: number;
  price?: number;
  categorie?: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'vehicle';
  productId?: string;
  produit?: CartItemProduct;
  vehicleId?: string;
  vehicleName?: string;
  imageUrl?: string | null;
  quantite: number;
  prixUnitaire: number;
  totalLigne: number;
  // Options for vehicle rental
  startDate?: string;
  endDate?: string;
  days?: number;
  withDriver?: boolean;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalAmount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addProductToCart: (product: { id: string; nom?: string; prix_unitaire?: number; image_url?: string | null }, quantity?: number) => Promise<boolean>;
  addVehicleToCart: (vehicle: {
    id: string;
    marque: string;
    modele: string;
    image_url?: string | null;
    dailyPrice: number;
    startDate: string;
    endDate: string;
    days: number;
    withDriver: boolean;
  }) => Promise<boolean>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCartQuote: (payload: BuildQuotePayload) => Promise<ValidateQuoteResult>;
  saveLastOrder: (order: LastOrder) => Promise<void>;
  getLastOrder: () => Promise<LastOrder | null>;
  clearLastOrder: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Storage key for vehicle bookings
  const vehicleCartKey = user?.id ? `@soutarah_vehicle_cart_${user.id}` : '@soutarah_vehicle_cart_guest';

  // ─── Charger le panier complet (API Produits + Local Véhicules) ───────────
  const refreshCart = useCallback(async () => {
    if (!token) {
      // Si non connecté, lire le panier local
      try {
        const savedVehicles = await AsyncStorage.getItem(vehicleCartKey);
        const parsed = savedVehicles ? JSON.parse(savedVehicles) : [];
        setItems(parsed);
      } catch {
        setItems([]);
      }
      return;
    }

    try {
      setLoading(true);
      const combinedItems: CartItem[] = [];

      // 1. Charger les produits synchronisés depuis la base de données backend (/api/cart)
      const res = await api.get<{ cart?: { items?: any[] } }>('/cart').catch(() => null);
      if (res?.cart?.items && Array.isArray(res.cart.items)) {
        res.cart.items.forEach(item => {
          const product = item.produit || {};
          const qty = Number(item.quantite || item.quantity || 1);
          const unitPrice = Number(product.prix_unitaire || item.prix_unitaire || 0);

          combinedItems.push({
            id: item.id,
            type: 'product',
            productId: product.id || item.produit_id,
            produit: {
              id: product.id || item.produit_id,
              nom: product.nom || 'Produit',
              reference: product.reference,
              image_url: product.image_url,
              prix_unitaire: unitPrice,
            },
            quantite: qty,
            prixUnitaire: unitPrice,
            totalLigne: unitPrice * qty,
          });
        });
      }

      // 2. Charger les locations de véhicules
      const savedVehicles = await AsyncStorage.getItem(vehicleCartKey);
      if (savedVehicles) {
        const parsedVehicles: CartItem[] = JSON.parse(savedVehicles);
        if (Array.isArray(parsedVehicles)) {
          combinedItems.push(...parsedVehicles);
        }
      }

      setItems(combinedItems);
    } catch (e) {
      console.error('Erreur chargement panier:', e);
    } finally {
      setLoading(false);
    }
  }, [token, vehicleCartKey]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ─── Ajouter un produit au panier (Synchro directe avec DB) ───────────────
  const addProductToCart = async (
    product: { id: string; nom?: string; prix_unitaire?: number; image_url?: string | null },
    quantity: number = 1
  ): Promise<boolean> => {
    if (token) {
      try {
        await api.post('/cart/items', { productId: product.id, quantity });
        await refreshCart();
        return true;
      } catch (e) {
        console.error('Erreur ajout produit API:', e);
        return false;
      }
    } else {
      // Panier invité
      const newItem: CartItem = {
        id: `prod_${product.id}_${Date.now()}`,
        type: 'product',
        productId: product.id,
        produit: {
          id: product.id,
          nom: product.nom,
          prix_unitaire: product.prix_unitaire,
          image_url: product.image_url,
        },
        quantite: quantity,
        prixUnitaire: product.prix_unitaire || 0,
        totalLigne: (product.prix_unitaire || 0) * quantity,
      };
      setItems(prev => [...prev, newItem]);
      return true;
    }
  };

  // ─── Ajouter un véhicule au panier ───────────────────────────────────────
  const addVehicleToCart = async (vehicle: {
    id: string;
    marque: string;
    modele: string;
    image_url?: string | null;
    dailyPrice: number;
    startDate: string;
    endDate: string;
    days: number;
    withDriver: boolean;
  }): Promise<boolean> => {
    try {
      const driverFeePerDay = vehicle.withDriver ? 10000 : 0;
      const totalDaily = vehicle.dailyPrice + driverFeePerDay;
      const totalLigne = totalDaily * vehicle.days;

      const newVehicleItem: CartItem = {
        id: `veh_${vehicle.id}_${Date.now()}`,
        type: 'vehicle',
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.marque} ${vehicle.modele}`,
        imageUrl: vehicle.image_url,
        quantite: 1,
        prixUnitaire: totalDaily,
        totalLigne,
        startDate: vehicle.startDate,
        endDate: vehicle.endDate,
        days: vehicle.days,
        withDriver: vehicle.withDriver,
      };

      const savedVehicles = await AsyncStorage.getItem(vehicleCartKey);
      const list: CartItem[] = savedVehicles ? JSON.parse(savedVehicles) : [];
      const updated = [...list, newVehicleItem];
      await AsyncStorage.setItem(vehicleCartKey, JSON.stringify(updated));

      // Notifier le backend comme le fait le site (notification admin + email
      // « Location ajoutée au panier » via /cart/notify-vehicle).
      if (token) {
        api.post('/cart/notify-vehicle', {
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.marque} ${vehicle.modele}`,
          startDate: vehicle.startDate,
          endDate: vehicle.endDate,
          days: vehicle.days,
          withDriver: vehicle.withDriver,
        }).catch(err => console.error('Erreur notification ajout véhicule:', err?.response?.data || err));
      }

      await refreshCart();
      return true;
    } catch (e) {
      console.error('Erreur ajout véhicule panier:', e);
      return false;
    }
  };

  // ─── Mettre à jour la quantité d'un article ──────────────────────────────
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'product' && token && !itemId.startsWith('prod_')) {
      try {
        await api.patch(`/cart/items/${itemId}`, { quantity });
        await refreshCart();
      } catch (e) {
        console.error('Erreur mise à jour item panier:', e);
      }
    } else if (item.type === 'vehicle') {
      // Véhicules
      const savedVehicles = await AsyncStorage.getItem(vehicleCartKey);
      if (savedVehicles) {
        const list: CartItem[] = JSON.parse(savedVehicles);
        const updated = list.map(v =>
          v.id === itemId
            ? { ...v, quantite: quantity, totalLigne: v.prixUnitaire * quantity }
            : v
        );
        await AsyncStorage.setItem(vehicleCartKey, JSON.stringify(updated));
        await refreshCart();
      }
    }
  };

  // ─── Supprimer un article du panier ──────────────────────────────────────
  const removeItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'product' && token && !itemId.startsWith('prod_')) {
      try {
        await api.delete(`/cart/items/${itemId}`);
        await refreshCart();
      } catch (e) {
        console.error('Erreur suppression item:', e);
      }
    } else {
      // Véhicule ou invité
      const savedVehicles = await AsyncStorage.getItem(vehicleCartKey);
      if (savedVehicles) {
        const list: CartItem[] = JSON.parse(savedVehicles);
        const updated = list.filter(v => v.id !== itemId);
        await AsyncStorage.setItem(vehicleCartKey, JSON.stringify(updated));
      }
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  // ─── Vider le panier ─────────────────────────────────────────────────────
  const clearCart = async () => {
    if (token) {
      try {
        await api.delete('/cart').catch(() => {});
      } catch {}
    }
    await AsyncStorage.removeItem(vehicleCartKey);
    setItems([]);
  };

  // ─── Créer la demande de devis (MÊME PROCÉDÉ QUE LE SITE) ───────────────
  // POST /quote-requests avec le snapshot des articles. Le panier N'EST PAS
  // vidé ici : il ne sera vidé qu'après la confirmation de la commande
  // (page « Passer commande »), exactement comme sur le site.
  const validateCartQuote = async (payload: BuildQuotePayload) => {
    if (!token) {
      return { success: false, message: 'Veuillez vous connecter pour valider votre demande.' };
    }

    try {
      const res = await api.post<{ quoteRequest?: { reference?: string } }>('/quote-requests', {
        service: payload.service,
        title: payload.title,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        description: payload.description,
        budget: payload.budget,
        items: payload.items,
      });

      const reference = res?.quoteRequest?.reference || '';
      return {
        success: !!reference,
        message: reference
          ? 'Votre devis a été créé avec succès !'
          : 'Le devis a été créé sans référence.',
        reference,
        quoteRequest: res?.quoteRequest as any,
      };
    } catch (e: any) {
      console.error('Erreur création devis:', e);
      return {
        success: false,
        message: e?.message || 'Une erreur est survenue lors de la création du devis.',
      };
    }
  };

  // ─── Dernière commande — même clé locale que le site web ────────────────
  const LAST_ORDER_KEY = '@soutarah_last_order';

  const saveLastOrder = async (order: LastOrder) => {
    try {
      await AsyncStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch (e) {
      console.error('Erreur enregistrement commande:', e);
    }
  };

  const getLastOrder = async (): Promise<LastOrder | null> => {
    try {
      const raw = await AsyncStorage.getItem(LAST_ORDER_KEY);
      return raw ? (JSON.parse(raw) as LastOrder) : null;
    } catch {
      return null;
    }
  };

  const clearLastOrder = async () => {
    try {
      await AsyncStorage.removeItem(LAST_ORDER_KEY);
    } catch {}
  };

  // Calculs totaux
  const cartCount = items.reduce((acc, curr) => acc + curr.quantite, 0);
  const totalAmount = items.reduce((acc, curr) => acc + curr.totalLigne, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        totalAmount,
        loading,
        refreshCart,
        addProductToCart,
        addVehicleToCart,
        updateItemQuantity,
        removeItem,
        clearCart,
        validateCartQuote,
        saveLastOrder,
        getLastOrder,
        clearLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
