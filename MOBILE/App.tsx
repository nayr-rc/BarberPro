import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useAuthStore } from './src/stores/useAuthStore';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const isExpoGo = Constants.appOwnership === 'expo';

async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.info('Expo Go detectado: notificacoes push remotas foram desativadas neste ambiente.');
    return null;
  }

  if (!Device.isDevice) {
    console.info('Notificacoes push exigem um dispositivo fisico.');
    return null;
  }

  let token: string | null = null;

  if (isExpoGo) {
    console.warn('Push notifications are not supported in Expo Go. Use a development build.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.info('Project ID do Expo/EAS nao configurado. Pulando registro de push token.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.error('Falha ao obter token push:', e);
  }

  return token;
}

export default function App() {
  const { isHydrated, token, user, hydrate, registerPushToken } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (token && user?.id && !isExpoGo) {
      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          void registerPushToken(pushToken);
        }
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notificação recebida:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Resposta à notificação:', response);
      });

      return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
    }
  }, [token, user?.id, registerPushToken, isExpoGo]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4a574" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>{token ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
