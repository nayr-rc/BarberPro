import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';

type DayConfig = {
  dayId: number;
  dayLabel: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

const DAYS: DayConfig[] = [
  { dayId: 0, dayLabel: 'Domingo', isOpen: false, startTime: '09:00', endTime: '19:00' },
  { dayId: 1, dayLabel: 'Segunda', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 2, dayLabel: 'Terça', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 3, dayLabel: 'Quarta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 4, dayLabel: 'Quinta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 5, dayLabel: 'Sexta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 6, dayLabel: 'Sábado', isOpen: false, startTime: '09:00', endTime: '19:00' },
];

export function DisponibilidadeScreen() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<DayConfig[]>(DAYS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const response = await api.get('/availability', { params: { barberId: user.id } });
        const current = (response.data?.schedule || []) as DayConfig[];
        if (!Array.isArray(current) || !current.length) {
          setSchedule(DAYS);
        } else {
          const filled = DAYS.map((day) => current.find((item) => item.dayId === day.dayId) || day);
          setSchedule(filled);
        }
      } catch {
        setSchedule(DAYS);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const updateDay = (dayId: number, patch: Partial<DayConfig>) => {
    setSchedule((prev) => prev.map((item) => (item.dayId === dayId ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    if (!user?.id) return;

    const invalid = schedule.find((item) => item.isOpen && item.startTime >= item.endTime);
    if (invalid) {
      setMessage(`Horário inválido em ${invalid.dayLabel}.`);
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await api.post('/availability', {
        barberId: user.id,
        workingHours: schedule,
      });
      setMessage('Disponibilidade salva com sucesso.');
    } catch {
      setMessage('Falha ao salvar disponibilidade.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disponibilidade</Text>
      {isLoading ? (
        <ActivityIndicator color="#d4a574" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {schedule.map((day) => (
            <View key={day.dayId} style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                <Switch value={day.isOpen} onValueChange={(value) => updateDay(day.dayId, { isOpen: value })} />
              </View>
              {day.isOpen && (
                <View style={styles.rowTimes}>
                  <TextInput
                    value={day.startTime}
                    onChangeText={(value) => updateDay(day.dayId, { startTime: value })}
                    placeholder="09:00"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />
                  <Text style={styles.separator}>até</Text>
                  <TextInput
                    value={day.endTime}
                    onChangeText={(value) => updateDay(day.dayId, { endTime: value })}
                    placeholder="19:00"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable style={styles.saveButton} onPress={() => void save()} disabled={isSaving}>
        <Text style={styles.saveText}>{isSaving ? 'Salvando...' : 'Salvar horários'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  rowTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#020617',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  separator: {
    color: '#94a3b8',
  },
  message: {
    marginTop: 8,
    marginBottom: 10,
    color: '#d4a574',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#d4a574',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
