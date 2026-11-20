import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TimetableProvider } from './src/context/TimetableContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <ThemeProvider>
        <AuthProvider>
          <TimetableProvider>
            <AppContent />
          </TimetableProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
  },
});
