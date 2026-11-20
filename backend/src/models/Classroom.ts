import mongoose, { Schema, Document } from 'mongoose';
import { RoomType } from './Course.js';

export interface IClassroom extends Document {
  roomNumber: string;
  building: string;
  capacity: number;
  type: RoomType;
  features: string[];
  isAvailable: boolean;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    building: { type: String, required: true },
    capacity: { type: Number, required: true, default: 40 },
    type: {
      type: String,
      enum: ['Lecture Room', 'Computer Lab', 'Science Lab', 'Seminar Hall'],
      default: 'Lecture Room',
    },
    features: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ClassroomModel = mongoose.model<IClassroom>('Classroom', ClassroomSchema);
