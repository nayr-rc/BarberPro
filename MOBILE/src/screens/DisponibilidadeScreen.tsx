import { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch, 
  Text, 
  TextInput, 
  View,
  TouchableOpacity,
  Alert
} from 'react-native';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

type DayConfig = {
  dayId: number;
  dayLabel: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

const DAYS: DayConfig[] = [
  { dayId: 0, dayLabel: 'Domingo', isOpen: false, startTime: '09:00', endTime: '18:00' },
  { dayId: 1, dayLabel: 'Segunda', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 2, dayLabel: 'Terça', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 3, dayLabel: 'Quarta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 4, dayLabel: 'Quinta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 5, dayLabel: 'Sexta', isOpen: true, startTime: '09:00', endTime: '19:00' },
  { dayId: 6, dayLabel: 'Sábado', isOpen: true, startTime: '09:00', endTime: '17:00' },
];

export function DisponibilidadeScreen() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<DayConfig[]>(DAYS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const response = await api.get('/availability', { params: { barberId: user.id } });
        const current = (response.data?.schedule || []) as DayConfig[];
        if (Array.isArray(current) && current.length > 0) {
          const filled = DAYS.map((day) => {
            const found = current.find((item) => item.dayId === day.dayId);
            return found ? { ...day, ...found } : day;
          });
          setSchedule(filled);
        }
      } catch (err) {
        console.error('Erro ao carregar disponibilidade:', err);
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
      Alert.alert('Erro', `Horário de início deve ser antes do fim em ${invalid.dayLabel}.`);
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/availability', {
        barberId: user.id,
        workingHours: schedule,
      });
      Alert.alert('Sucesso', 'Disponibilidade salva com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Falha ao salvar disponibilidade.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Disponibilidade</Text>
          <Text style={styles.subtitle}>Gerencie seus horários de atendimento</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveTopBtn, isSaving && { opacity: 0.5 }]} 
          onPress={() => void save()}
          disabled={isSaving}
        >
          <Text style={styles.saveTopBtnText}>{isSaving ? '...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#d4a574" size="large" />
          <Text style={styles.loaderText}>Carregando agenda...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              Ative os dias da semana que você atende e defina o intervalo de trabalho.
            </Text>
          </View>

          {schedule.map((day) => (
            <View key={day.dayId} style={[styles.card, !day.isOpen && styles.cardDisabled]}>
              <View style={styles.cardHeader}>
                <View style={[styles.dayBadge, !day.isOpen && styles.dayBadgeDisabled]}>
                  <Text style={styles.dayBadgeText}>{day.dayLabel.substring(0, 3).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.dayName, !day.isOpen && styles.dayNameDisabled]}>{day.dayLabel}</Text>
                  <Text style={styles.dayStatus}>
                    {day.isOpen ? 'Aberto para agendamentos' : 'Fechado / Folga'}
                  </Text>
                </View>
                <Switch 
                  value={day.isOpen} 
                  onValueChange={(value) => updateDay(day.dayId, { isOpen: value })} 
                  trackColor={{ false: '#1e293b', true: 'rgba(16,185,129,0.3)' }}
                  thumbColor={day.isOpen ? '#10b981' : '#475569'}
                />
              </View>

              {day.isOpen && (
                <View style={styles.timeSection}>
                  <View style={styles.timeInputBox}>
                    <Text style={styles.timeLabel}>Início</Text>
                    <TextInput
                      value={day.startTime}
                      onChangeText={(value) => updateDay(day.dayId, { startTime: value })}
                      placeholder="09:00"
                      placeholderTextColor="#475569"
                      style={styles.timeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View style={styles.timeDivider}>
                    <Text style={styles.timeDividerText}>às</Text>
                  </View>
                  <View style={styles.timeInputBox}>
                    <Text style={styles.timeLabel}>Término</Text>
                    <TextInput
                      value={day.endTime}
                      onChangeText={(value) => updateDay(day.dayId, { endTime: value })}
                      placeholder="19:00"
                      placeholderTextColor="#475569"
                      style={styles.timeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 8, 
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  saveTopBtn: { backgroundColor: '#d4a574', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  saveTopBtnText: { color: '#020617', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#475569', marginTop: 16, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  scroll: { padding: 20 },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(212,165,116,0.05)', 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(212,165,116,0.1)',
    marginBottom: 24,
    alignItems: 'center'
  },
  infoEmoji: { fontSize: 20, marginRight: 12 },
  infoText: { flex: 1, color: '#d4a574', fontSize: 12, fontWeight: '600', lineHeight: 18 },

  card: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12
  },
  cardDisabled: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  dayBadge: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(212,165,116,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,165,116,0.2)'
  },
  dayBadgeDisabled: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'transparent' },
  dayBadgeText: { color: '#d4a574', fontSize: 11, fontWeight: '900' },
  dayName: { color: '#f8fafc', fontSize: 17, fontWeight: '800' },
  dayNameDisabled: { color: '#64748b' },
  dayStatus: { color: '#475569', fontSize: 11, fontWeight: '600', marginTop: 2 },

  timeSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  timeInputBox: { flex: 1 },
  timeLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 4 },
  timeInput: { 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#f8fafc',
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center'
  },
  timeDivider: { paddingHorizontal: 12, paddingTop: 18 },
  timeDividerText: { color: '#475569', fontSize: 12, fontWeight: '700' },
});
