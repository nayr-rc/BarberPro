import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgendaScreen } from '../screens/AgendaScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FinanceiroScreen } from '../screens/FinanceiroScreen';
import { ManagementNavigator } from './ManagementNavigator';

type AppTabParamList = {
  DashboardTab: undefined;
  AgendaTab: undefined;
  FinanceiroTab: undefined;
  GestaoTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList, undefined>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#f8fafc',
        headerShown: false, // Navigation will be handled by nested stacks headers
        tabBarStyle: { backgroundColor: '#020617', borderTopColor: '#0f172a' },
        tabBarActiveTintColor: '#d4a574',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ title: 'Home', headerShown: true }} 
      />
      <Tab.Screen 
        name="AgendaTab" 
        component={AgendaScreen} 
        options={{ title: 'Agenda', headerShown: true }} 
      />
      <Tab.Screen 
        name="FinanceiroTab" 
        component={FinanceiroScreen} 
        options={{ title: 'Financeiro', headerShown: true }} 
      />
      <Tab.Screen 
        name="GestaoTab" 
        component={ManagementNavigator} 
        options={{ title: 'Gestão' }} 
      />
    </Tab.Navigator>
  );
}
