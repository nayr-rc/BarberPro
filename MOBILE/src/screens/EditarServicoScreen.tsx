import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useServicosStore, Service } from '../stores/useServicosStore';
import { useNavigation, useRoute } from '@react-navigation/native';

export function EditarServicoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { adicionarServico, atualizarServico, removerServico, isLoading } = useServicosStore();
  
  const editingService = route.params?.service as Service | undefined;

  const [name, setName] = useState(editingService?.name || '');
  const [description, setDescription] = useState(editingService?.description || '');
  const [price, setPrice] = useState(editingService?.price?.toString() || '');
  const [duration, setDuration] = useState(editingService?.duration?.toString() || '');

  const handleSave = async () => {
    if (!name || !price || !duration) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const data = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
    };

    try {
      if (editingService) {
        await atualizarServico(editingService.id, data);
      } else {
        await adicionarServico(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o serviço.');
    }
  };

  const handleDelete = () => {
    if (!editingService) return;

    Alert.alert(
      'Remover Serviço',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await removerServico(editingService.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o serviço.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Nome do Serviço *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Corte de Cabelo"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Descrição (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Corte degradê com acabamento..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Preço (R$) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Duração (Min) *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, isLoading && styles.disabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar Serviço'}
          </Text>
        </Pressable>

        {editingService && (
          <Pressable
            style={[styles.deleteButton, isLoading && styles.disabled]}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>Excluir Serviço</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scroll: {
    padding: 16,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#d4a574',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  deleteButtonText: {
    color: '#f87171',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
