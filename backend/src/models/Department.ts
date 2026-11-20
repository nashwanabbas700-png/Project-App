import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  building: string;
  contactEmail: string;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    building: { type: String, required: true },
    contactEmail: { type: String, required: true },
  },
  { timestamps: true }
);

export const DepartmentModel = mongoose.model<IDepartment>('Department', DepartmentSchema);
