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
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const initial = (firstName?.[0] || user?.name?.[0] || 'B').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header/Avatar Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Text style={styles.editAvatarIcon}>📸</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileTitle}>{firstName} {lastName}</Text>
            <Text style={styles.profileRole}>Barbeiro Especialista</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionHeading}>Dados Pessoais</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Seu nome"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Sobrenome</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Seu sobrenome"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>WhatsApp / Contato</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                />
                <Text style={styles.inputIcon}>📞</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionHeading}>Configurações de Conta</Text>
            <View style={styles.readOnlyBox}>
              <View style={styles.readOnlyHeader}>
                <Text style={styles.readOnlyLabel}>E-mail</Text>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>🔒 Bloqueado</Text>
                </View>
              </View>
              <Text style={styles.readOnlyValue}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Salvando...' : 'Atualizar Perfil'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1 },
  scroll: { padding: 20 },
  
  // Header section
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 35, 
    backgroundColor: '#d4a574', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#d4a574',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  avatarText: { fontSize: 42, color: '#020617', fontWeight: '900' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editAvatarIcon: { fontSize: 16 },
  profileTitle: { color: '#f8fafc', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  profileRole: { color: '#475569', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },

  // Cards
  formCard: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20
  },
  sectionHeading: { 
    color: '#64748b', 
    fontSize: 11, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    marginBottom: 20
  },
  fieldGroup: { marginBottom: 16 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 8, paddingLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16
  },
  input: { flex: 1, color: '#f8fafc', paddingVertical: 14, fontSize: 15, fontWeight: '600' },
  inputIcon: { opacity: 0.5, fontSize: 16 },

  // Read only section
  readOnlyBox: { paddingVertical: 4 },
  readOnlyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  readOnlyLabel: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  lockedBadge: { backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  lockedText: { color: '#38bdf8', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  readOnlyValue: { color: '#475569', fontSize: 15, fontWeight: '600' },

  // Action button
  saveButton: { 
    backgroundColor: '#d4a574', 
    borderRadius: 18, 
    paddingVertical: 18, 
    alignItems: 'center', 
    shadowColor: '#d4a574',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 8
  },
  saveButtonText: { color: '#020617', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  disabled: { opacity: 0.5 },
});
