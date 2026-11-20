import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const TOKEN_KEY = 'edunova_jwt_token';
const USER_KEY = '@edunova_user_data';

export const AuthStorage = {
  /**
   * Securely saves the authentication token using Keychain/KeyStore on native,
   * falling back to AsyncStorage on Web.
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
    } catch (e) {
      console.warn('Failed to save auth token securely, falling back to AsyncStorage', e);
      try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } catch (err) {
        console.error('Critical auth save failure', err);
      }
    }
  },

  /**
   * Retrieves the secure JWT token.
   */
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
      // Fallback check in AsyncStorage if migrated
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      try {
        return await AsyncStorage.getItem(TOKEN_KEY);
      } catch {
        return null;
      }
    }
  },

  /**
   * Persists serialized user information.
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user info', e);
    }
  },

  /**
   * Retrieves parsed user information.
   */
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Clears the active session and credentials.
   */
  async clear(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch {}
      }
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  },
};
