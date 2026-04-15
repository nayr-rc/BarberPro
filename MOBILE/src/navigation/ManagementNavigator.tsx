import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServicosScreen } from '../screens/ServicosScreen';
import { EditarServicoScreen } from '../screens/EditarServicoScreen';
import { ClientesScreen } from '../screens/ClientesScreen';
import { DisponibilidadeScreen } from '../screens/DisponibilidadeScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ManagementStackParamList = {
  ManagementLanding: undefined;
  Servicos: undefined;
  EditarServico: { service?: unknown } | undefined;
  Clientes: undefined;
  Disponibilidade: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<ManagementStackParamList, undefined>();

type MenuItem = {
  title: string;
  subtitle: string;
  icon: string;
  screen: keyof ManagementStackParamList;
  accent: string;
  accentBg: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Meu Perfil',
    subtitle: 'Nome, telefone e dados',
    icon: '👤',
    screen: 'Perfil',
    accent: '#d4a574',
    accentBg: 'rgba(212,165,116,0.1)',
  },
  {
    title: 'Meus Serviços',
    subtitle: 'Preços e duração dos cortes',
    icon: '✂️',
    screen: 'Servicos',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.1)',
  },
  {
    title: 'Meus Clientes',
    subtitle: 'Histórico e contatos',
    icon: '👥',
    screen: 'Clientes',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    title: 'Minha Disponibilidade',
    subtitle: 'Horários de trabalho',
    icon: '📆',
    screen: 'Disponibilidade',
    accent: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.1)',
  },
];

function ManagementLandingScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Gestão</Text>
          <Text style={styles.subtitle}>Gerencie seu negócio</Text>
        </View>

        <View style={styles.grid}>
          {MENU_ITEMS.map(item => (
            <Pressable
              key={item.screen}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.accentBg }]}>
                <Text style={styles.cardEmoji}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.chevron, { color: item.accent }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Servicos"
        component={ServicosScreen}
        options={{ title: 'Serviços', headerShown: false }}
      />
      <Stack.Screen
        name="EditarServico"
        component={EditarServicoScreen}
        options={({ route }: any) => ({
          title: route.params?.service ? 'Editar Serviço' : 'Novo Serviço',
        })}
      />
      <Stack.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{ title: 'Clientes', headerShown: false }}
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
  safe: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1, backgroundColor: '#020617' },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { color: '#475569', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },

  grid: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '800', marginBottom: 3 },
  cardSubtitle: { color: '#475569', fontSize: 11, fontWeight: '600' },
  chevron: { fontSize: 28, fontWeight: '700' },
});
