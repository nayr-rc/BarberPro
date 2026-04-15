import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  RefreshControl, Modal, Alert, Linking, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { useAgendaStore } from '../stores/useAgendaStore';
import { Appointment } from '../types/appointment';

type FilterStatus = 'Todos' | 'Upcoming' | 'Past' | 'Cancelled';

const STATUS_FILTERS: FilterStatus[] = ['Todos', 'Upcoming', 'Past', 'Cancelled'];
const STATUS_LABEL: Record<FilterStatus, string> = {
  Todos: 'Todos',
  Upcoming: 'Confirmados',
  Past: 'Concluídos',
  Cancelled: 'Cancelados',
};

export function AgendaScreen() {
  const { user } = useAuthStore();
  const { appointments, isLoading, loadAppointments, markAsAttended, cleanupExpired } = useAgendaStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todos');
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const reload = useCallback(async () => {
    if (user?.id) await loadAppointments(user.id);
  }, [loadAppointments, user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const timer = setInterval(() => cleanupExpired(), 30000);
    return () => clearInterval(timer);
  }, [cleanupExpired]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleMarkAttended = async (id: string) => {
    setUpdatingId(id);
    try {
      await markAsAttended(id);
      setSelectedEvent(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível marcar como atendido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = appointments.filter(a =>
    filterStatus === 'Todos' ? true : a.status === filterStatus
  );

  const fmtDateTime = (dt: string) => {
    try {
      const d = new Date(dt);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return dt; }
  };

  const fmtTime = (dt: string) => {
    try { return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <Pressable style={styles.card} onPress={() => setSelectedEvent(item)}>
      <View style={styles.cardTime}>
        <Text style={styles.cardTimeText}>{fmtTime(item.appointmentDateTime)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardClient}>{item.clientName}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>{item.serviceName}</Text></View>
          <View style={styles.badgeAmber}><Text style={styles.badgeAmberText}>{item.status}</Text></View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardPrice}>R$ {item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minha Agenda</Text>
          <Text style={styles.subtitle}>Gestão de Horários</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Status filters */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map(s => (
          <Pressable
            key={s}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
            onPress={() => setFilterStatus(s)}
          >
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
              {STATUS_LABEL[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshing={isLoading}
        onRefresh={onRefresh}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4a574" />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
          </View>
        }
      />

      {/* Modal de detalhes */}
      <Modal visible={!!selectedEvent} transparent animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedEvent(null)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeading}>Resumo do Atendimento</Text>

            {selectedEvent && (
              <>
                <View style={styles.modalClientRow}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{selectedEvent.clientName[0]?.toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalClientName}>{selectedEvent.clientName}</Text>
                    <Text style={styles.modalClientTime}>{fmtDateTime(selectedEvent.appointmentDateTime)}</Text>
                  </View>
                </View>

                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalInfoIcon}>✂️</Text>
                  <Text style={styles.modalInfoText}>{selectedEvent.serviceName}</Text>
                  <Text style={styles.modalInfoPrice}>R$ {selectedEvent.price}</Text>
                </View>

                {selectedEvent.status === 'Upcoming' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setSelectedEvent(null)}
                    >
                      <Text style={styles.modalCancelText}>Voltar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalAttendedBtn, updatingId === selectedEvent.id && { opacity: 0.5 }]}
                      disabled={updatingId === selectedEvent.id}
                      onPress={() => void handleMarkAttended(selectedEvent.id)}
                    >
                      <Text style={styles.modalAttendedText}>
                        {updatingId === selectedEvent.id ? 'Salvando...' : 'Cliente Atendido'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedEvent.status !== 'Upcoming' && (
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedEvent(null)}>
                    <Text style={styles.modalAttendedText}>Fechar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '800', textTransform: 'uppercase' },
  subtitle: { color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  refreshIcon: { color: '#10b981', fontSize: 22, fontWeight: '700' },

  // Filters
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterChipActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
  filterChipText: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  filterChipTextActive: { color: '#10b981' },

  // List
  list: { padding: 16, gap: 10 },
  emptyCard: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 1 },

  // Card
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 16, gap: 12 },
  cardTime: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center' },
  cardTimeText: { color: '#10b981', fontWeight: '900', fontSize: 12 },
  cardClient: { color: '#f8fafc', fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badgeGreen: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' },
  badgeGreenText: { color: '#10b981', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  badgeAmber: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  badgeAmberText: { color: '#f59e0b', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { color: '#10b981', fontWeight: '900', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0f172a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  modalHandle: { width: 48, height: 5, backgroundColor: '#1e293b', borderRadius: 4, alignSelf: 'center', marginBottom: 24 },
  modalHeading: { color: '#64748b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20 },
  modalClientRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  modalAvatar: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center' },
  modalAvatarText: { color: '#10b981', fontSize: 24, fontWeight: '900' },
  modalClientName: { color: '#f8fafc', fontSize: 22, fontWeight: '800', textTransform: 'uppercase' },
  modalClientTime: { color: '#10b981', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  modalInfoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, gap: 12, marginBottom: 20 },
  modalInfoIcon: { fontSize: 20 },
  modalInfoText: { flex: 1, color: '#cbd5e1', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  modalInfoPrice: { color: '#10b981', fontWeight: '900', fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center' },
  modalCancelText: { color: '#ef4444', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  modalAttendedBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#d4a574', alignItems: 'center' },
  modalAttendedText: { color: '#020617', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  modalCloseBtn: { paddingVertical: 16, borderRadius: 16, backgroundColor: '#d4a574', alignItems: 'center' },
});
