import mongoose, { Schema, Document } from 'mongoose';

export interface IHistoricalTimetable extends Document {
  semester: string; // e.g. "Fall 2025", "Spring 2025"
  courseCode: string;
  courseName: string;
  department: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  day: string;
  startTime: string;
  endTime: string;
  section: string;
  successRating: number; // 1 to 5 stars (historical student/faculty satisfaction)
  conflictCount: number; // 0 indicates a historically smooth, conflict-free slot
  historicalPreferences: {
    facultyPreferredSlot: boolean;
    highAttendanceRate: boolean;
    labEfficiencyScore: number;
  };
}

const HistoricalTimetableSchema = new Schema<IHistoricalTimetable>(
  {
    semester: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    department: { type: String, required: true },
    facultyId: { type: String, required: true },
    facultyName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    section: { type: String, required: true },
    successRating: { type: Number, default: 4.5 },
    conflictCount: { type: Number, default: 0 },
    historicalPreferences: {
      facultyPreferredSlot: { type: Boolean, default: true },
      highAttendanceRate: { type: Boolean, default: true },
      labEfficiencyScore: { type: Number, default: 90 },
    },
  },
  { timestamps: true }
);

export const HistoricalTimetableModel = mongoose.model<IHistoricalTimetable>(
  'HistoricalTimetable',
  HistoricalTimetableSchema
);
