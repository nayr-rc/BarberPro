import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View, Linking, Alert } from 'react-native';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

// URL da página web de agendamento
const WEB_AGENAMENTO_URL = 'https://barberpro-frontend-n8qp.onrender.com';

export function WelcomeScreen({ navigation }: Props) {
  const handleClienteAgendar = async () => {
    try {
      // Abre a página web de agendamento no navegador do cliente
      const supported = await Linking.canOpenURL(WEB_AGENAMENTO_URL);
      if (supported) {
        await Linking.openURL(WEB_AGENAMENTO_URL);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir a página de agendamento.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a página de agendamento.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarberPro Mobile</Text>
      <Text style={styles.subtitle}>Painel do barbeiro</Text>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.primaryText}>Sou barbeiro (Entrar)</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleClienteAgendar}>
        <Text style={styles.secondaryText}>📅 Sou cliente (Agendar online)</Text>
      </Pressable>

      <Text style={styles.hint}>
        Clientes serão direcionados para nossa plataforma web de agendamento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#d4a574',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
