import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { useGanhosStore } from '../stores/useGanhosStore';

export function FinanceiroScreen() {
  const { user } = useAuthStore();
  const { resumo, isLoading, carregarResumo } = useGanhosStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) void carregarResumo(user.id);
  }, [user?.id, carregarResumo]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) await carregarResumo(user.id);
    setRefreshing(false);
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} tintColor="#d4a574" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
          <Text style={styles.subtitle}>Métricas em tempo real</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          <View style={[styles.metricCard, styles.greenCard]}>
            <View style={styles.metricIconWrap}>
              <Text style={styles.metricEmoji}>💰</Text>
            </View>
            <Text style={styles.metricLabel}>Faturamento Hoje</Text>
            <Text style={styles.metricValue}>{isLoading ? '...' : fmt(resumo.totalHoje)}</Text>
          </View>

          <View style={[styles.metricCard, styles.amberCard]}>
            <View style={styles.metricIconWrap}>
              <Text style={styles.metricEmoji}>📊</Text>
            </View>
            <Text style={styles.metricLabel}>Essa Semana</Text>
            <Text style={styles.metricValue}>{isLoading ? '...' : fmt(resumo.totalSemana)}</Text>
          </View>

          <View style={[styles.metricCard, styles.goldCard]}>
            <View style={styles.metricIconWrapGold}>
              <Text style={styles.metricEmoji}>🏆</Text>
            </View>
            <Text style={styles.metricLabelGold}>Faturamento do Mês</Text>
            <Text style={styles.metricValueGold}>{isLoading ? '...' : fmt(resumo.totalMes)}</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Os valores consideram todos os atendimentos confirmados no período. Puxe para baixo para atualizar.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1, backgroundColor: '#020617' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },

  cards: { paddingHorizontal: 20, gap: 16 },
  metricCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 4 },
  greenCard: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' },
  amberCard: { backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)' },
  goldCard: { backgroundColor: '#d4a574', borderColor: '#b48a5e' },

  metricIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  metricIconWrapGold: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  metricEmoji: { fontSize: 24 },
  metricLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  metricValue: { color: '#f8fafc', fontSize: 32, fontWeight: '900' },
  metricLabelGold: { color: 'rgba(2,6,23,0.7)', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  metricValueGold: { color: '#020617', fontSize: 40, fontWeight: '900' },

  infoBanner: { flexDirection: 'row', marginHorizontal: 20, marginTop: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 18, marginTop: 2 },
  infoText: { flex: 1, color: '#64748b', fontSize: 12, lineHeight: 18 },
});
