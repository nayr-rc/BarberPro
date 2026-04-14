import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveCustomerProfile } from '../lib/customerProfile';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ClientRegister'>;

export function ClientRegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const maskPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let masked = '';
    
    if (cleaned.length > 0) {
      masked = '(' + cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
      masked += ') ' + cleaned.substring(2, 7);
    }
    if (cleaned.length > 7) {
      masked += '-' + cleaned.substring(7, 11);
    }
    
    return masked;
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers and basic symbols for the mask
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setPhone(maskPhone(cleaned));
    }
  };

  const handleContinue = async () => {
    if (!fullName.trim() || !phone.trim()) {
      setError('Informe nome e telefone para continuar.');
      return;
    }

    const profile = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    };

    await saveCustomerProfile(profile);
    navigation.navigate('PublicBooking', { profile });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro do Cliente</Text>
      <Text style={styles.subtitle}>Esses dados serão usados no agendamento público</Text>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nome completo"
        placeholderTextColor="#64748b"
        style={styles.input}
      />
      <TextInput
        value={phone}
        onChangeText={handlePhoneChange}
        placeholder="Telefone (WhatsApp) (00) 00000-0000"
        placeholderTextColor="#64748b"
        keyboardType="phone-pad"
        maxLength={15}
        style={styles.input}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email (opcional)"
        placeholderTextColor="#64748b"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continuar para agendamento</Text>
      </Pressable>
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
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
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
  },
});
