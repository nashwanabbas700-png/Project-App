import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { StudentNavigator } from './StudentNavigator';
import { FacultyNavigator } from './FacultyNavigator';
import { AdminNavigator } from './AdminNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.primary }]}>
        <View style={styles.splashLogoWrap}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.splashBrand}>EduNova SmartSched</Text>
        <Text style={styles.splashSub}>City University Academic Portal</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {role === 'admin' && <AdminNavigator />}
      {role === 'faculty' && <FacultyNavigator />}
      {role === 'student' && <StudentNavigator />}
      {!role && <StudentNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  splashLogoWrap: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2E7CF6',
    marginBottom: 16,
  },
  splashLogo: {
    width: 80,
    height: 80,
  },
  splashBrand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  splashSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
});
