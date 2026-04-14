import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useServicosStore, Service } from '../stores/useServicosStore';
import { useNavigation } from '@react-navigation/native';

export function ServicosScreen() {
  const { services, isLoading, carregarServicos, removerServico } = useServicosStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    void carregarServicos();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>
          {item.duration} min • {formatCurrency(item.price)}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.navigate('EditarServico', { service: item })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Serviços</Text>
        <Pressable
          onPress={() => navigation.navigate('EditarServico')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Novo</Text>
        </Pressable>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void carregarServicos()}
            tintColor="#d4a574"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>Nenhum serviço cadastrado.</Text>
          ) : (
            <ActivityIndicator size="large" color="#d4a574" style={{ marginTop: 24 }} />
          )
        }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#d4a574',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#020617',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  details: {
    color: '#94a3b8',
    fontSize: 14,
  },
  actions: {
    marginLeft: 12,
  },
  editButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  editButtonText: {
    color: '#d4a574',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
