import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, Linking, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClientesStore, Cliente } from '../stores/useClientesStore';

export function ClientesScreen() {
  const { clientes, isLoading, carregarClientes } = useClientesStore();

  useEffect(() => { void carregarClientes(); }, []);

  const renderItem = ({ item }: { item: Cliente }) => {
    const initial = item.name?.[0]?.toUpperCase() ?? '?';
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
        </View>
        {item.phone ? (
          <TouchableOpacity
            style={styles.waBtn}
            onPress={() => Linking.openURL(`https://wa.me/55${item.phone?.replace(/\D/g, '')}`)}
          >
            <Text style={styles.waBtnText}>💬</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Clientes</Text>
          <Text style={styles.subtitle}>Histórico de atendimentos</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{clientes.length}</Text>
        </View>
      </View>

      <FlatList
        data={clientes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void carregarClientes()} tintColor="#d4a574" />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#d4a574" style={{ marginTop: 48 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
  countBadge: { backgroundColor: 'rgba(212,165,116,0.1)', borderWidth: 1, borderColor: 'rgba(212,165,116,0.3)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 },
  countText: { color: '#d4a574', fontWeight: '900', fontSize: 18 },

  list: { padding: 16, gap: 12 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 16, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(212,165,116,0.1)', borderWidth: 2, borderColor: '#d4a574', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#d4a574', fontSize: 20, fontWeight: '900' },
  info: { flex: 1, gap: 2 },
  name: { color: '#f8fafc', fontSize: 15, fontWeight: '800' },
  email: { color: '#64748b', fontSize: 12 },
  phone: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  waBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', justifyContent: 'center', alignItems: 'center' },
  waBtnText: { fontSize: 20 },

  emptyCard: { marginTop: 60, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
