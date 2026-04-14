import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuthStore } from '../stores/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Preencha email e senha.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch {
      setLocalError('Falha no login. Confira suas credenciais.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarberPro Mobile</Text>
      <Text style={styles.subtitle}>Entrar no painel do barbeiro</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Senha"
        placeholderTextColor="#64748b"
        secureTextEntry
        style={styles.input}
      />

      {(localError || error) && <Text style={styles.error}>{localError || error}</Text>}

      <Pressable onPress={handleLogin} style={styles.button} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </Pressable>

      <Pressable 
        onPress={() => navigation.navigate('ForgotPassword' as never)}
        style={styles.forgotBtn}
      >
        <Text style={styles.forgotText}>Esqueceu a senha?</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('ClientRegister')} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Quero agendar como cliente</Text>
      </Pressable>

      <Text style={styles.hint}>
        Dica: configure EXPO_PUBLIC_API_URL no app para apontar para sua API.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    color: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: '#fb7185',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#d4a574',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  forgotBtn: {
    marginTop: 4,
    alignItems: 'center',
    padding: 8,
  },
  forgotText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
});
