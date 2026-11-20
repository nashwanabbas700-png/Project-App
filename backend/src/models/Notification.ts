import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'TIMETABLE_PUBLISHED'
  | 'TIMETABLE_UPDATED'
  | 'CLASS_RESCHEDULED'
  | 'ROOM_CHANGED'
  | 'CLASS_CANCELLED'
  | 'GENERAL_ANNOUNCEMENT';

export interface INotification extends Document {
  recipientFacultyId?: string; // If undefined, broadcast to all faculty
  title: string;
  message: string;
  type: NotificationType;
  relatedCourseCode?: string;
  relatedRoom?: string;
  relatedDay?: string;
  relatedTime?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientFacultyId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'TIMETABLE_PUBLISHED',
        'TIMETABLE_UPDATED',
        'CLASS_RESCHEDULED',
        'ROOM_CHANGED',
        'CLASS_CANCELLED',
        'GENERAL_ANNOUNCEMENT',
      ],
      default: 'GENERAL_ANNOUNCEMENT',
    },
    relatedCourseCode: { type: String },
    relatedRoom: { type: String },
    relatedDay: { type: String },
    relatedTime: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
