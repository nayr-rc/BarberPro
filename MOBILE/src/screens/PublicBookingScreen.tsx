import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../lib/api';
import { loadCustomerProfile } from '../lib/customerProfile';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { BarberOption, CustomerProfile } from '../types/customer';

type Props = NativeStackScreenProps<AuthStackParamList, 'PublicBooking'>;

type BarberApi = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

const toBarberLabel = (barber: BarberApi) => {
  const name = barber.name || `${barber.firstName || ''} ${barber.lastName || ''}`.trim();
  return name || 'Barbeiro';
};

export function PublicBookingScreen({ route, navigation }: Props) {
  const incomingProfile = route.params?.profile;

  const [profile, setProfile] = useState<CustomerProfile | null>(incomingProfile || null);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const saved = incomingProfile || (await loadCustomerProfile());
        if (saved) {
          setProfile(saved);
        }

        const response = await api.get('/barbers', { params: { limit: 100, sortBy: 'firstName:asc' } });
        const results = (response.data?.results || []) as BarberApi[];
        const mapped = results.map((item) => ({ id: item.id, name: toBarberLabel(item) }));
        setBarbers(mapped);
        if (mapped.length) {
          setSelectedBarberId(mapped[0].id);
        }
      } catch {
        setMessage('Falha ao carregar barbeiros.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [incomingProfile]);

  const canSubmit = useMemo(() => {
    return !!profile?.fullName && !!profile.phone && !!selectedBarberId && !!serviceName.trim() && !!dateValue && !!timeValue;
  }, [profile, selectedBarberId, serviceName, dateValue, timeValue]);

  const handleSubmit = async () => {
    if (!canSubmit || !profile) {
      setMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    const isoDate = `${dateValue}T${timeValue}:00.000Z`;
    setIsSubmitting(true);
    setMessage(null);

    try {
      await api.post('/appointments/public', {
        barberId: selectedBarberId,
        serviceName: serviceName.trim(),
        datetimeStart: isoDate,
        guestName: profile.fullName,
        guestPhone: profile.phone,
        email: profile.email || '',
        additionalNotes: notes.trim(),
      });

      setMessage('Agendamento criado com sucesso!');
      setServiceName('');
      setDateValue('');
      setTimeValue('');
      setNotes('');
    } catch {
      setMessage('Não foi possível concluir o agendamento público.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamento Público</Text>
      <Text style={styles.subtitle}>Preencha os dados e confirme seu horário</Text>

      {isLoading ? (
        <ActivityIndicator color="#d4a574" />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.value}>{profile?.fullName || 'Sem cadastro'}</Text>
          <Text style={styles.valueSecondary}>{profile?.phone || 'Sem telefone'}</Text>

          <Text style={styles.label}>Barbeiro</Text>
          <View style={styles.pickerWrap}>
            {barbers.map((barber) => (
              <Pressable
                key={barber.id}
                style={[styles.pill, selectedBarberId === barber.id ? styles.pillActive : undefined]}
                onPress={() => setSelectedBarberId(barber.id)}
              >
                <Text style={[styles.pillText, selectedBarberId === barber.id ? styles.pillTextActive : undefined]}>{barber.name}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Serviço (ex: Corte + Barba)"
            placeholderTextColor="#64748b"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              value={dateValue}
              onChangeText={setDateValue}
              placeholder="Data (YYYY-MM-DD)"
              placeholderTextColor="#64748b"
              style={[styles.input, styles.rowInput]}
            />
            <TextInput
              value={timeValue}
              onChangeText={setTimeValue}
              placeholder="Hora (HH:mm)"
              placeholderTextColor="#64748b"
              style={[styles.input, styles.rowInput]}
            />
          </View>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações (opcional)"
            placeholderTextColor="#64748b"
            style={styles.input}
          />

          {message && <Text style={styles.message}>{message}</Text>}

          <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit || isSubmitting}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Enviando...' : 'Confirmar agendamento'}</Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => navigation.navigate('ClientRegister')}>
            <Text style={styles.linkText}>Editar cadastro do cliente</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
    justifyContent: 'center',
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
    marginBottom: 18,
  },
  form: {
    gap: 10,
  },
  label: {
    color: '#d4a574',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  valueSecondary: {
    color: '#94a3b8',
    marginBottom: 4,
  },
  pickerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillActive: {
    borderColor: '#d4a574',
    backgroundColor: '#d4a5741f',
  },
  pillText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  pillTextActive: {
    color: '#f8fafc',
    fontWeight: '700',
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowInput: {
    flex: 1,
  },
  message: {
    color: '#f8fafc',
    textAlign: 'center',
    marginTop: 2,
  },
  button: {
    marginTop: 6,
    backgroundColor: '#d4a574',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 2,
    alignItems: 'center',
  },
  linkText: {
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
});
