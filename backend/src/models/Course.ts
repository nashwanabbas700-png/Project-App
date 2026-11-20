import mongoose, { Schema, Document } from 'mongoose';

export type RoomType = 'Lecture Room' | 'Computer Lab' | 'Science Lab' | 'Seminar Hall';

export interface ICourse extends Document {
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  weeklySessions: number;
  durationMinutes: number;
  requiredRoomType: RoomType;
  isLab: boolean;
  assignedFacultyId?: string; // string facultyId reference e.g. "FAC-1001"
  assignedFacultyName?: string;
  sections: string[];
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    credits: { type: Number, required: true, default: 3 },
    weeklySessions: { type: Number, required: true, default: 2 },
    durationMinutes: { type: Number, default: 90 },
    requiredRoomType: {
      type: String,
      enum: ['Lecture Room', 'Computer Lab', 'Science Lab', 'Seminar Hall'],
      default: 'Lecture Room',
    },
    isLab: { type: Boolean, default: false },
    assignedFacultyId: { type: String },
    assignedFacultyName: { type: String },
    sections: [{ type: String }],
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model<ICourse>('Course', CourseSchema);
