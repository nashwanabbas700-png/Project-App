import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TimetableEntry, TimetableMetadata, DetectedConflict, NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { realtimeSocket } from '../services/socket';

interface TimetableContextType {
  masterEntries: TimetableEntry[];
  facultyEntries: TimetableEntry[];
  activeTimetable: TimetableMetadata | null;
  conflicts: DetectedConflict[];
  unreadNotificationCount: number;
  notifications: NotificationItem[];
  isLoading: boolean;
  selectedSemester: string;
  setSelectedSemester: (sem: string) => void;
  refreshAll: () => Promise<void>;
  refreshFacultyTimetable: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const TimetableContext = createContext<TimetableContextType>({} as TimetableContextType);

export const TimetableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [masterEntries, setMasterEntries] = useState<TimetableEntry[]>([]);
  const [facultyEntries, setFacultyEntries] = useState<TimetableEntry[]>([]);
  const [activeTimetable, setActiveTimetable] = useState<TimetableMetadata | null>(null);
  const [conflicts, setConflicts] = useState<DetectedConflict[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [selectedSemester, setSelectedSemester] = useState<string>('Fall 2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchMasterTimetable = useCallback(async () => {
    try {
      const res = await api.getMasterTimetable({ semester: selectedSemester });
      if (res.success) {
        setMasterEntries(res.entries);
        setActiveTimetable(res.timetable);
        setConflicts(res.conflicts || []);
      }
    } catch (e) {
      console.warn('Could not fetch master timetable', e);
    }
  }, [selectedSemester]);

  const fetchFacultyTimetable = useCallback(async () => {
    if (!user?.facultyId && user?.role !== 'faculty') return;
    try {
      const res = await api.getFacultyPersonalTimetable(user?.facultyId);
      if (res.success) {
        setFacultyEntries(res.entries);
      }
    } catch (e) {
      console.warn('Could not fetch faculty timetable', e);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotifications(user?.facultyId);
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadNotificationCount(res.unreadCount);
      }
    } catch (e) {
      console.warn('Could not fetch notifications', e);
    }
  }, [isAuthenticated, user]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchMasterTimetable(), fetchFacultyTimetable(), fetchNotifications()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMasterTimetable, fetchFacultyTimetable, fetchNotifications]);

  // Initial load and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  // Listen to real-time events via Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubTimetable = realtimeSocket.onTimetableUpdated((payload) => {
      console.log('[Realtime] Timetable updated received:', payload);
      fetchMasterTimetable();
      fetchFacultyTimetable();
      fetchNotifications();
    });

    const unsubNotification = realtimeSocket.onNewNotification((notif) => {
      console.log('[Realtime] New notification received:', notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
    });

    return () => {
      unsubTimetable();
      unsubNotification();
    };
  }, [isAuthenticated, fetchMasterTimetable, fetchFacultyTimetable, fetchNotifications]);

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Failed to mark read', e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(user?.facultyId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (e) {
      console.warn('Failed to mark all read', e);
    }
  };

  return (
    <TimetableContext.Provider
      value={{
        masterEntries,
        facultyEntries,
        activeTimetable,
        conflicts,
        unreadNotificationCount,
        notifications,
        isLoading,
        selectedSemester,
        setSelectedSemester,
        refreshAll,
        refreshFacultyTimetable: fetchFacultyTimetable,
        refreshNotifications: fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetable = () => useContext(TimetableContext);
