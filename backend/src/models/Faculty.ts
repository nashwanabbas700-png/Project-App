import mongoose, { Schema, Document } from 'mongoose';

export interface IUnavailableSlot {
  day: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface IFaculty extends Document {
  facultyId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  preferredTimes: string[]; // e.g. ["Morning", "Afternoon"] or ["09:00-11:00"]
  unavailableDays: string[];
  unavailableSlots: IUnavailableSlot[];
  phone: string;
  office: string;
  avatarUrl?: string;
}

const FacultySchema = new Schema<IFaculty>(
  {
    facultyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    maxWeeklyHours: { type: Number, default: 16 },
    currentWeeklyHours: { type: Number, default: 0 },
    preferredTimes: [{ type: String }],
    unavailableDays: [{ type: String }],
    unavailableSlots: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        reason: { type: String },
      },
    ],
    phone: { type: String, default: '' },
    office: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const FacultyModel = mongoose.model<IFaculty>('Faculty', FacultySchema);
