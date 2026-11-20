import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetableMetrics {
  hardConstraintsViolated: number;
  softConstraintsSatisfaction: number; // 0 - 100%
  workloadBalanceScore: number; // 0 - 100%
  historicalAlignmentScore: number; // 0 - 100%
}

export interface ITimetable extends Document {
  title: string;
  semester: string;
  academicYear: string;
  department?: string;
  status: 'draft' | 'generated' | 'published';
  qualityScore: number; // 0 - 100
  metrics: ITimetableMetrics;
  publishedAt?: Date;
  publishedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    title: { type: String, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    department: { type: String, default: 'All' },
    status: { type: String, enum: ['draft', 'generated', 'published'], default: 'draft' },
    qualityScore: { type: Number, default: 0 },
    metrics: {
      hardConstraintsViolated: { type: Number, default: 0 },
      softConstraintsSatisfaction: { type: Number, default: 0 },
      workloadBalanceScore: { type: Number, default: 0 },
      historicalAlignmentScore: { type: Number, default: 0 },
    },
    publishedAt: { type: Date },
    publishedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const TimetableModel = mongoose.model<ITimetable>('Timetable', TimetableSchema);
