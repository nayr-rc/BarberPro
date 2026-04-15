import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  RefreshControl, Share, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import { useAgendaStore } from '../stores/useAgendaStore';
import { useGanhosStore } from '../stores/useGanhosStore';

const API_BASE = 'https://barberpro-frontend-n8qp.onrender.com';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { appointments, isLoading: agendaLoading, loadAppointments, markAsAttended, cleanupExpired } = useAgendaStore();
  const { resumo, isLoading: ganhosLoading, carregarResumo } = useGanhosStore();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const bookingLink = `${API_BASE}/agendar/${user?.id ?? ''}`;

  const loadAll = useCallback(async () => {
    if (user?.id) {
      await Promise.all([loadAppointments(user.id), carregarResumo(user.id)]);
    }
  }, [user?.id, loadAppointments, carregarResumo]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const timer = setInterval(() => cleanupExpired(), 30000);
    return () => clearInterval(timer);
  }, [cleanupExpired]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({ message: bookingLink });
    } catch { /* noop */ }
  };

  const handleMarkAttended = async (id: string) => {
    setUpdatingId(id);
    try {
      await markAsAttended(id);
    } catch {
      Alert.alert('Erro', 'Não foi possível marcar como atendido agora.');
    } finally {
      setUpdatingId(null);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter(a =>
    new Date(a.appointmentDateTime).toISOString().slice(0, 10) === todayStr
  );

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Barbeiro';
  const initial = firstName[0]?.toUpperCase() ?? 'B';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4a574" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Olá, <Text style={styles.greetingName}>{firstName}</Text></Text>
              <Text style={styles.subtitle}>Barbeiro Especialista</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
            <Text style={styles.logoutIcon}>⏻</Text>
          </TouchableOpacity>
        </View>

        {/* Link de agendamento */}
        <View style={styles.linkCard}>
          <View>
            <Text style={styles.linkTitle}>🔗 <Text style={styles.linkTitleAccent}>Meu Link</Text> de Agendamento</Text>
            <Text style={styles.linkSub}>Compartilhe com seus clientes</Text>
          </View>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{bookingLink}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleShareLink}>
              <Text style={styles.copyBtnText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Métricas */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.metricGreen]}>
            <Text style={styles.metricIcon}>📅</Text>
            <Text style={styles.metricLabel}>Agenda Hoje</Text>
            <Text style={styles.metricValue}>{todayAppointments.length}<Text style={styles.metricUnit}> Atend.</Text></Text>
          </View>
          <View style={[styles.metricCard, styles.metricAmber]}>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={styles.metricLabel}>Faturamento (Hoje)</Text>
            <Text style={styles.metricValue}>{ganhosLoading ? '...' : fmtCurrency(resumo.totalHoje)}</Text>
          </View>
        </View>
        <View style={[styles.metricCard, styles.metricBlue, { marginHorizontal: 20, marginBottom: 24 }]}>
          <Text style={styles.metricIcon}>👥</Text>
          <Text style={styles.metricLabel}>Faturamento do Mês</Text>
          <Text style={styles.metricValue}>{ganhosLoading ? '...' : fmtCurrency(resumo.totalMes)}</Text>
        </View>

        {/* Agenda Hoje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Agenda Hoje</Text>
          {agendaLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Carregando...</Text>
            </View>
          ) : todayAppointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum atendimento para hoje.</Text>
            </View>
          ) : (
            todayAppointments.slice(0, 8).map(a => (
              <View key={a.id} style={styles.appointmentCard}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.appointmentTimeText}>
                    {new Date(a.appointmentDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appointmentClient}>{a.clientName}</Text>
                  <Text style={styles.appointmentService}>{a.serviceName}</Text>
                </View>
                <View style={styles.appointmentRight}>
                  <Text style={styles.appointmentPrice}>R$ {a.price}</Text>
                  <Pressable
                    style={[styles.attendedBtn, updatingId === a.id && { opacity: 0.5 }]}
                    disabled={updatingId === a.id}
                    onPress={() => void handleMarkAttended(a.id)}
                  >
                    <Text style={styles.attendedBtnText}>{updatingId === a.id ? '...' : 'Atendido'}</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Atalhos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atalhos</Text>
          <View style={styles.shortcutsRow}>
            <TouchableOpacity
              style={styles.shortcutCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('GestaoTab', { screen: 'Servicos' })}
            >
              <Text style={styles.shortcutEmoji}>✂️</Text>
              <Text style={styles.shortcutLabel}>Serviços</Text>
              <Text style={styles.shortcutSub}>Preços e duração</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('GestaoTab', { screen: 'Disponibilidade' })}
            >
              <Text style={styles.shortcutEmoji}>📆</Text>
              <Text style={styles.shortcutLabel}>Disponibilidade</Text>
              <Text style={styles.shortcutSub}>Horários de trabalho</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1, backgroundColor: '#020617' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  avatarText: { color: '#022c22', fontSize: 22, fontWeight: '900' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  greetingName: { color: '#10b981' },
  subtitle: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 2, textTransform: 'uppercase' },
  logoutBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  logoutIcon: { fontSize: 18, color: '#ef4444' },

  // Link card
  linkCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', padding: 20, gap: 12 },
  linkTitle: { fontSize: 16, fontWeight: '900', color: '#f8fafc', textTransform: 'uppercase' },
  linkTitleAccent: { color: '#10b981' },
  linkSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 4, gap: 8 },
  linkText: { flex: 1, fontSize: 11, fontFamily: 'monospace', color: 'rgba(16,185,129,0.8)', paddingLeft: 8 },
  copyBtn: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  copyBtnText: { color: '#10b981', fontWeight: '800', fontSize: 12 },

  // Metrics
  metricsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 12 },
  metricCard: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1, gap: 4 },
  metricGreen: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.1)' },
  metricAmber: { backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.1)' },
  metricBlue: { backgroundColor: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.1)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricIcon: { fontSize: 20 },
  metricLabel: { fontSize: 9, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1 },
  metricValue: { fontSize: 22, fontWeight: '900', color: '#f8fafc' },
  metricUnit: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  // Sections
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', textTransform: 'uppercase', marginBottom: 12 },

  // Appointments
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderStyle: 'dashed', padding: 32, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: '500', letterSpacing: 1 },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 10, gap: 12 },
  appointmentTime: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center' },
  appointmentTimeText: { color: '#10b981', fontSize: 13, fontWeight: '900' },
  appointmentClient: { color: '#f8fafc', fontWeight: '700', textTransform: 'uppercase' },
  appointmentService: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  appointmentRight: { alignItems: 'flex-end', gap: 6 },
  appointmentPrice: { color: '#10b981', fontWeight: '900', fontSize: 16 },
  attendedBtn: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  attendedBtnText: { color: '#10b981', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

  // Shortcuts
  shortcutsRow: { flexDirection: 'row', gap: 12 },
  shortcutCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, gap: 4 },
  shortcutEmoji: { fontSize: 28, marginBottom: 8 },
  shortcutLabel: { color: '#f8fafc', fontWeight: '800', textTransform: 'uppercase', fontSize: 13 },
  shortcutSub: { color: '#475569', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
