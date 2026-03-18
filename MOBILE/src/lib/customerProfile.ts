import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerProfile } from '../types/customer';

const STORAGE_KEY = 'barberpro-mobile-customer-profile';

export const saveCustomerProfile = async (profile: CustomerProfile) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const loadCustomerProfile = async (): Promise<CustomerProfile | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerProfile;
  } catch {
    return null;
  }
};
