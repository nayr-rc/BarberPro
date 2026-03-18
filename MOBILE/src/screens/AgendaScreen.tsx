import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useAgendaStore } from '../stores/useAgendaStore';

export function AgendaScreen() {
  const { user } = useAuthStore();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda Completa</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => user?.id && void loadAppointments(user.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum agendamento pendente.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.client}>{item.clientName}</Text>
              <Text style={styles.meta}>{item.serviceName}</Text>
              <Text style={styles.meta}>{new Date(item.appointmentDateTime).toLocaleString('pt-BR')}</Text>
            </View>
            <Pressable onPress={() => void markAsAttended(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>Marcar atendido</Text>
            </Pressable>
          </View>
        )}
      />
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
  empty: {
    marginTop: 24,
    color: '#94a3b8',
    textAlign: 'center',
  },
  row: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  client: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#022c22',
    fontSize: 12,
    fontWeight: '700',
  },
});
