import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgendaScreen } from '../screens/AgendaScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DisponibilidadeScreen } from '../screens/DisponibilidadeScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#f8fafc',
        tabBarStyle: { backgroundColor: '#020617', borderTopColor: '#0f172a' },
        tabBarActiveTintColor: '#d4a574',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Disponibilidade" component={DisponibilidadeScreen} />
    </Tab.Navigator>
  );
}
