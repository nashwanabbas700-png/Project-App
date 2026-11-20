import mongoose, { Schema, Document } from 'mongoose';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ITimetableEntry extends Document {
  timetableId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  roomType: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  semester: string;
  section: string;
  department: string;
  color: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TimetableEntrySchema = new Schema<ITimetableEntry>(
  {
    timetableId: { type: String, required: true, index: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    facultyId: { type: String, required: true, index: true },
    facultyName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    roomType: { type: String, default: 'Lecture Room' },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    department: { type: String, required: true },
    color: { type: String, default: '#3B82F6' },
    status: {
      type: String,
      enum: ['scheduled', 'rescheduled', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

export const TimetableEntryModel = mongoose.model<ITimetableEntry>('TimetableEntry', TimetableEntrySchema);
