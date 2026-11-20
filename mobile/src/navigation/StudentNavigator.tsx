import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Home, Calendar, BookOpen, Bell, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { StudentHomeScreen } from '../screens/student/StudentHomeScreen';
import { StudentTimetableScreen } from '../screens/student/StudentTimetableScreen';
import { StudentCoursesScreen } from '../screens/student/StudentCoursesScreen';
import { StudentNotificationsScreen } from '../screens/student/StudentNotificationsScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();

export const StudentNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

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
        name="StudentHome"
        component={StudentHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={StudentTimetableScreen}
        options={{
          tabBarLabel: 'Timetable',
          tabBarIcon: ({ color, size }) => <Calendar size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={StudentCoursesScreen}
        options={{
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={StudentNotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
