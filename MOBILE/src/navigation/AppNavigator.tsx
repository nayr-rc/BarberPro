import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
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

const icon = (emoji: string, size = 24) => <Text style={{ fontSize: size }}>{emoji}</Text>;

export function AppNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#040d1a',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 6,
          height: 62,
        },
        tabBarActiveTintColor: '#d4a574',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => icon(focused ? '🏠' : '🏡'),
        }}
      />
      <Tab.Screen
        name="AgendaTab"
        component={AgendaScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => icon(focused ? '📅' : '🗓️'),
        }}
      />
      <Tab.Screen
        name="FinanceiroTab"
        component={FinanceiroScreen}
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ focused }) => icon(focused ? '💰' : '💵'),
        }}
      />
      <Tab.Screen
        name="GestaoTab"
        component={ManagementNavigator}
        options={{
          title: 'Gestão',
          tabBarIcon: ({ focused }) => icon(focused ? '⚙️' : '🔧'),
        }}
      />
    </Tab.Navigator>
  );
}
