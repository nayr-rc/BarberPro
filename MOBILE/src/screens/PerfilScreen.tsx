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
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigation } from '@react-navigation/native';

export function PerfilScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');

  const handleSave = async () => {
    if (!firstName || !lastName || !contactNumber) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await updateProfile({
        firstName,
        lastName,
        contactNumber,
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Meu Perfil</Text>
        <Text style={styles.subtitle}>Mantenha seus dados de contato atualizados</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Nome"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Sobrenome</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Sobrenome"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Telefone de Contato</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="(00) 00000-0000"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>E-mail (não alterável)</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <Pressable
          style={[styles.saveButton, isLoading && styles.disabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
        </Pressable>
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
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 24,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoBox: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    opacity: 0.8,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#94a3b8',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#d4a574',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
