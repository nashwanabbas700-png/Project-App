import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

class RealtimeSocket {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public connect(facultyId?: string, isAdmin: boolean = false) {
    if (this.socket && this.isConnected) {
      this.joinRooms(facultyId, isAdmin);
      return;
    }

    try {
      this.socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[Socket] Connected to EduNova gateway');
        this.joinRooms(facultyId, isAdmin);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[Socket] Disconnected from EduNova gateway');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket Connection Error]', err.message);
      });
    } catch (e) {
      console.warn('[Socket Init Error]', e);
    }
  }

  private joinRooms(facultyId?: string, isAdmin: boolean = false) {
    if (!this.socket) return;
    if (facultyId) {
      this.socket.emit('join_faculty_room', facultyId);
    }
    if (isAdmin) {
      this.socket.emit('join_admin_room');
    }
  }

  public onTimetableUpdated(callback: (payload: any) => void) {
    if (!this.socket) return () => {};
    this.socket.on('timetable_updated', callback);
    this.socket.on('faculty_schedule_updated', callback);
    return () => {
      this.socket?.off('timetable_updated', callback);
      this.socket?.off('faculty_schedule_updated', callback);
    };
  }

  public onNewNotification(callback: (notification: any) => void) {
    if (!this.socket) return () => {};
    this.socket.on('new_notification', callback);
    return () => {
      this.socket?.off('new_notification', callback);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const realtimeSocket = new RealtimeSocket();

