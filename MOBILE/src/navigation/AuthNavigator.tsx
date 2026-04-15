import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList, undefined>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#f8fafc',
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Senha' }} />
    </Stack.Navigator>
  );
}
