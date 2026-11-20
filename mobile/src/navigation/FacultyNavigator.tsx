import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Home, Calendar, BookOpen, CalendarOff, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { FacultyHomeScreen } from '../screens/faculty/FacultyHomeScreen';
import { FacultyScheduleScreen } from '../screens/faculty/FacultyScheduleScreen';
import { FacultyClassesScreen } from '../screens/faculty/FacultyClassesScreen';
import { FacultyLeaveScreen } from '../screens/faculty/FacultyLeaveScreen';
import { FacultyProfileScreen } from '../screens/faculty/FacultyProfileScreen';

const Tab = createBottomTabNavigator();

export const FacultyNavigator: React.FC = () => {
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
        name="FacultyHome"
        component={FacultyHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={FacultyScheduleScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Classes"
        component={FacultyClassesScreen}
        options={{
          tabBarLabel: 'Classes',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Leave"
        component={FacultyLeaveScreen}
        options={{
          tabBarLabel: 'Leave',
          tabBarIcon: ({ color, size }) => <CalendarOff size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={FacultyProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default FacultyNavigator;
