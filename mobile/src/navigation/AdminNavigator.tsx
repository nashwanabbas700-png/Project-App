import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { LayoutDashboard, Calendar, Users, GraduationCap, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminTimetableScreen } from '../screens/admin/AdminTimetableScreen';
import { AdminFacultyScreen } from '../screens/admin/AdminFacultyScreen';
import { AdminStudentsScreen } from '../screens/admin/AdminStudentsScreen';
import { AdminSettingsScreen } from '../screens/admin/AdminSettingsScreen';

const Tab = createBottomTabNavigator();

export const AdminNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={AdminTimetableScreen}
        options={{
          tabBarLabel: 'Timetable',
          tabBarIcon: ({ color, size }) => <Calendar size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Faculty"
        component={AdminFacultyScreen}
        options={{
          tabBarLabel: 'Faculty',
          tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Students"
        component={AdminStudentsScreen}
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({ color, size }) => <GraduationCap size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
