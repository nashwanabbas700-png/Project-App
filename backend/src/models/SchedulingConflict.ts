import mongoose, { Schema, Document } from 'mongoose';

export type ConflictSeverity = 'CRITICAL' | 'WARNING';
export type ConflictType =
  | 'FACULTY_DOUBLE_BOOKING'
  | 'ROOM_DOUBLE_BOOKING'
  | 'SECTION_DOUBLE_BOOKING'
  | 'FACULTY_UNAVAILABLE'
  | 'ROOM_CAPACITY_EXCEEDED'
  | 'ROOM_TYPE_MISMATCH'
  | 'WORKLOAD_LIMIT_EXCEEDED'
  | 'BACK_TO_BACK_FATIGUE';

export interface ISchedulingConflict extends Document {
  timetableId: string;
  severity: ConflictSeverity;
  type: ConflictType;
  title: string;
  description: string;
  suggestedCorrection: string;
  day: string;
  startTime: string;
  endTime: string;
  facultyName?: string;
  facultyId?: string;
  roomNumber?: string;
  courseCode?: string;
  section?: string;
  isResolved: boolean;
  createdAt: Date;
}

const SchedulingConflictSchema = new Schema<ISchedulingConflict>(
  {
    timetableId: { type: String, required: true, index: true },
    severity: { type: String, enum: ['CRITICAL', 'WARNING'], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    suggestedCorrection: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    facultyName: { type: String },
    facultyId: { type: String },
    roomNumber: { type: String },
    courseCode: { type: String },
    section: { type: String },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SchedulingConflictModel = mongoose.model<ISchedulingConflict>(
  'SchedulingConflict',
  SchedulingConflictSchema
);
