import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailabilitySlot {
  startTime: string;
  endTime: string;
  status: 'available' | 'preferred' | 'unavailable';
}

export interface IFacultyAvailability extends Document {
  facultyId: string;
  day: string;
  slots: IAvailabilitySlot[];
}

const FacultyAvailabilitySchema = new Schema<IFacultyAvailability>(
  {
    facultyId: { type: String, required: true, index: true },
    day: { type: String, required: true },
    slots: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        status: { type: String, enum: ['available', 'preferred', 'unavailable'], default: 'available' },
      },
    ],
  },
  { timestamps: true }
);

export const FacultyAvailabilityModel = mongoose.model<IFacultyAvailability>('FacultyAvailability', FacultyAvailabilitySchema);
