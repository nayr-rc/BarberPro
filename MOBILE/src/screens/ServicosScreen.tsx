import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServicosStore, Service } from '../stores/useServicosStore';
import { useNavigation } from '@react-navigation/native';

export function ServicosScreen() {
  const { services, isLoading, carregarServicos } = useServicosStore();
  const navigation = useNavigation<any>();

  useEffect(() => { void carregarServicos(); }, []);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>✂️</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.detailRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⏱ {item.duration} min</Text>
          </View>
          <Text style={styles.price}>{fmt(item.price)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditarServico', { service: item })}
      >
        <Text style={styles.editBtnText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Serviços</Text>
          <Text style={styles.subtitle}>Configure preços e duração</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('EditarServico')}
        >
          <Text style={styles.addBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void carregarServicos()} tintColor="#d4a574" />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✂️</Text>
              <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
              <Text style={styles.emptySub}>Toque em "+ Novo" para adicionar seu primeiro serviço.</Text>
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
  addBtn: { backgroundColor: '#d4a574', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  addBtnText: { color: '#020617', fontWeight: '900', fontSize: 13 },

  list: { padding: 16, gap: 12 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 16, gap: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(212,165,116,0.1)', borderWidth: 1, borderColor: 'rgba(212,165,116,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardIconText: { fontSize: 22 },
  info: { flex: 1, gap: 6 },
  name: { color: '#f8fafc', fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: 'rgba(212,165,116,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(212,165,116,0.2)' },
  badgeText: { color: '#d4a574', fontSize: 11, fontWeight: '700' },
  price: { color: '#10b981', fontWeight: '900', fontSize: 15 },
  editBtn: { backgroundColor: 'rgba(212,165,116,0.1)', borderWidth: 1, borderColor: 'rgba(212,165,116,0.3)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  editBtnText: { color: '#d4a574', fontSize: 12, fontWeight: '800' },

  emptyCard: { marginTop: 60, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  emptySub: { color: '#475569', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
});
