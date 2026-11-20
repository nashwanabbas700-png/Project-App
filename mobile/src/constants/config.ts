import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the institutional API Gateway URL based on runtime environment:
 * 1. Checks EXPO_PUBLIC_API_URL environment variable (essential for physical Android devices).
 * 2. Checks Constants.expoConfig?.extra?.apiUrl.
 * 3. Fallback for Android Emulator: 10.0.2.2 reaches the host PC's localhost.
 * 4. Fallback for Web/iOS Simulator: localhost:5000.
 */
export const getApiBaseUrl = (): string => {
  // Check process.env.EXPO_PUBLIC_API_URL (Expo SDK standard)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // Check extra manifest config
  const manifestUrl = Constants.expoConfig?.extra?.apiUrl;
  if (manifestUrl && typeof manifestUrl === 'string' && manifestUrl.trim().length > 0) {
    return manifestUrl.trim();
  }

  // Android Emulator loopback alias to host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // Default web / iOS simulator
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@edunova.edu',
    password: 'Admin123!',
    role: 'admin' as const,
    name: 'University Registrar Admin',
    description: 'Administrator & Timetable Coordinator',
  },
  faculty: {
    email: 'faculty@edunova.edu',
    password: 'Faculty123!',
    role: 'faculty' as const,
    name: 'Dr. Sarah Jenkins',
    description: 'Faculty Member (Associate Professor, CS)',
  },
  student: {
    email: 'student@edunova.edu',
    password: 'Student123!',
    role: 'student' as const,
    name: 'Alex Rivera (CS-A)',
    description: 'Enrolled Student (BS Computer Science, Sec-A)',
  },
};

export const SEMESTER_OPTIONS = [
  'Fall 2026',
  'Spring 2027',
  'Fall 2025',
  'Spring 2025',
];

export const DEPARTMENT_OPTIONS = [
  'All',
  'Computer Science',
  'Electrical Engineering',
  'Business Administration',
];
