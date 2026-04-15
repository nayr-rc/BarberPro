import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServicosScreen } from '../screens/ServicosScreen';
import { EditarServicoScreen } from '../screens/EditarServicoScreen';
import { ClientesScreen } from '../screens/ClientesScreen';
import { DisponibilidadeScreen } from '../screens/DisponibilidadeScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type ManagementStackParamList = {
  ManagementLanding: undefined;
  Servicos: undefined;
  EditarServico: { service?: unknown } | undefined;
  Clientes: undefined;
  Disponibilidade: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<ManagementStackParamList, undefined>();

function ManagementLandingScreen() {
  const navigation = useNavigation<any>();

  const MenuButton = ({ title, icon, onPress }: any) => (
    <Pressable style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonText}>{title}</Text>
      <Text style={styles.chevron}>→</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerencie seu negócio</Text>
      <MenuButton title="Meu Perfil" onPress={() => navigation.navigate('Perfil')} />
      <MenuButton title="Meus Serviços" onPress={() => navigation.navigate('Servicos')} />
      <MenuButton title="Meus Clientes" onPress={() => navigation.navigate('Clientes')} />
      <MenuButton title="Minha Disponibilidade" onPress={() => navigation.navigate('Disponibilidade')} />
    </View>
  );
}

export function ManagementNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#f8fafc',
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <Stack.Screen 
        name="ManagementLanding" 
        component={ManagementLandingScreen} 
        options={{ title: 'Gestão' }} 
      />
      <Stack.Screen 
        name="Servicos" 
        component={ServicosScreen} 
        options={{ title: 'Serviços' }} 
      />
      <Stack.Screen 
        name="EditarServico" 
        component={EditarServicoScreen} 
        options={({ route }: any) => ({ 
          title: route.params?.service ? 'Editar Serviço' : 'Novo Serviço' 
        })} 
      />
      <Stack.Screen 
        name="Clientes" 
        component={ClientesScreen} 
        options={{ title: 'Clientes' }} 
      />
      <Stack.Screen 
        name="Disponibilidade" 
        component={DisponibilidadeScreen} 
        options={{ title: 'Disponibilidade' }} 
      />
      <Stack.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ title: 'Meu Perfil' }} 
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 24,
  },
  menuButton: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  menuButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    color: '#d4a574',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
