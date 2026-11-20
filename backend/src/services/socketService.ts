import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_faculty_room', (facultyId: string) => {
      socket.join(`faculty_${facultyId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined faculty room: faculty_${facultyId}`);
    });

    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`[Socket.IO] Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = (): SocketIOServer | null => ioInstance;

export const broadcastTimetableUpdate = (payload: {
  timetableId: string;
  action: string;
  affectedFacultyIds: string[];
  message: string;
  data?: any;
}) => {
  if (!ioInstance) return;

  // Emit to general institutional channel
  ioInstance.emit('timetable_updated', payload);

  // Emit to specific faculty rooms
  if (payload.affectedFacultyIds && payload.affectedFacultyIds.length > 0) {
    payload.affectedFacultyIds.forEach((facId) => {
      ioInstance!.to(`faculty_${facId}`).emit('faculty_schedule_updated', {
        ...payload,
        personalNotice: `Your teaching timetable has been updated by the administration.`,
      });
    });
  }
};

export const broadcastNotification = (facultyId: string | null, notification: any) => {
  if (!ioInstance) return;
  if (facultyId) {
    ioInstance.to(`faculty_${facultyId}`).emit('new_notification', notification);
  } else {
    ioInstance.emit('new_notification', notification);
  }
};
