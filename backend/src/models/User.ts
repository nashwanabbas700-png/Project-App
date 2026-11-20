import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  name: string;
  department?: string;
  facultyId?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    name: { type: String, required: true },
    department: { type: String },
    facultyId: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
