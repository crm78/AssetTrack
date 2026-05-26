import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import EmployeeListScreen from './EmployeeListScreen';
import CategoryListScreen from './CategoryListScreen';
import DeviceListScreen from './DeviceListScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    '员工': '👤',
    '分类': '📁',
    '设备': '💻',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '📄'}
    </Text>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="员工"
        component={EmployeeListScreen}
        options={{ title: '员工管理' }}
      />
      <Tab.Screen
        name="分类"
        component={CategoryListScreen}
        options={{ title: '设备分类' }}
      />
      <Tab.Screen
        name="设备"
        component={DeviceListScreen}
        options={{ title: '设备管理' }}
      />
    </Tab.Navigator>
  );
}
