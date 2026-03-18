import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useAgendaStore } from '../stores/useAgendaStore';

export function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const { appointments, isLoading, loadAppointments, markAsAttended, cleanupExpired } = useAgendaStore();

  useEffect(() => {
    if (user?.id) {
      void loadAppointments(user.id);
    }
  }, [loadAppointments, user?.id]);

  useEffect(() => {
    const timer = setInterval(() => cleanupExpired(), 30000);
    return () => clearInterval(timer);
  }, [cleanupExpired]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter((item) => item.appointmentDateTime.slice(0, 10) === today).length;
  }, [appointments]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name || user?.firstName || 'Barbeiro'}</Text>
      <Text style={styles.metric}>Agenda hoje: {todayCount}</Text>

      <FlatList
        data={appointments.slice(0, 8)}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => user?.id && void loadAppointments(user.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Sem atendimentos pendentes.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.client}>{item.clientName}</Text>
              <Text style={styles.service}>{item.serviceName}</Text>
              <Text style={styles.datetime}>{new Date(item.appointmentDateTime).toLocaleString('pt-BR')}</Text>
            </View>
            <Pressable style={styles.attendedButton} onPress={() => void markAsAttended(item.id)}>
              <Text style={styles.attendedText}>Atendido</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.logoutButton} onPress={() => void logout()}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  metric: {
    color: '#d4a574',
    marginTop: 6,
    marginBottom: 10,
    fontWeight: '600',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  empty: {
    marginTop: 24,
    color: '#94a3b8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  client: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  service: {
    color: '#94a3b8',
    fontSize: 12,
  },
  datetime: {
    color: '#64748b',
    fontSize: 12,
  },
  attendedButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attendedText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 12,
  },
  logoutButton: {
    marginBottom: 16,
    backgroundColor: '#7f1d1d',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fecaca',
    fontWeight: '700',
  },
});
