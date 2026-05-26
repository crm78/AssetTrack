import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function saveUserInfo(user: UserInfo): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUserInfo(): Promise<UserInfo | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as UserInfo;
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
