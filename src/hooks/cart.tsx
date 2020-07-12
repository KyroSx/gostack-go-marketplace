import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const productStorageItemKey = '@GoMarketPlace:products';

  async function clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsFromStorage = await AsyncStorage.getItem(
        productStorageItemKey,
      );

      if (productsFromStorage) {
        setProducts(JSON.parse(productsFromStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => item.id === product.id);

      const newProduct = {
        ...product,
        quantity: 1,
      };

      const newProducts = [...products];

      if (productIndex >= 0) {
        newProducts[productIndex].quantity += 1;
      }

      setProducts(productIndex >= 0 ? newProducts : [...products, newProduct]);

      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(newProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const newProducts = products.map(product => {
        if (product.id === id) {
          return { ...product, quantity: product.quantity + 1 };
        }

        return product;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          if (product.quantity >= 1) {
            const newProduct = { ...product, quantity: product.quantity - 1 };
            return newProduct;
          }
        }

        return product;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem(
        productStorageItemKey,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
