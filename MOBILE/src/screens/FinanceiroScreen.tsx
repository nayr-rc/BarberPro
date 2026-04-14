import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useGanhosStore } from '../stores/useGanhosStore';

export function FinanceiroScreen() {
  const { user } = useAuthStore();
  const { resumo, isLoading, carregarResumo } = useGanhosStore();

  useEffect(() => {
    if (user?.id) {
      void carregarResumo(user.id);
    }
  }, [user?.id, carregarResumo]);

  const onRefresh = () => {
    if (user?.id) {
      void carregarResumo(user.id);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#d4a574" />
      }
    >
      <Text style={styles.title}>Financeiro</Text>
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Hoje</Text>
          <Text style={styles.cardValue}>{formatCurrency(resumo.totalHoje)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Essa Semana</Text>
          <Text style={styles.cardValue}>{formatCurrency(resumo.totalSemana)}</Text>
        </View>

        <View style={styles.cardHighlight}>
          <Text style={styles.cardLabelHighlight}>Esse Mês</Text>
          <Text style={styles.cardValueHighlight}>{formatCurrency(resumo.totalMes)}</Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 8,
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHighlight: {
    backgroundColor: '#d4a574',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b48a5e',
    marginTop: 8,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  cardValue: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardLabelHighlight: {
    color: '#432c10',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardValueHighlight: {
    color: '#020617',
    fontSize: 36,
    fontWeight: 'bold',
  },
});
