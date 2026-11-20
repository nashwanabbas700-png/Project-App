import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetableHistory extends Document {
  timetableId: string;
  action: 'TIMETABLE_CREATED' | 'AUTO_GENERATED' | 'ENTRY_ADDED' | 'ENTRY_MODIFIED' | 'ENTRY_DELETED' | 'PUBLISHED';
  modifiedBy: string;
  modificationDate: Date;
  summary: string;
  previousSchedule?: any;
  newSchedule?: any;
  affectedFacultyIds: string[];
  reason: string;
}

const TimetableHistorySchema = new Schema<ITimetableHistory>(
  {
    timetableId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['TIMETABLE_CREATED', 'AUTO_GENERATED', 'ENTRY_ADDED', 'ENTRY_MODIFIED', 'ENTRY_DELETED', 'PUBLISHED'],
      required: true,
    },
    modifiedBy: { type: String, required: true },
    modificationDate: { type: Date, default: Date.now },
    summary: { type: String, required: true },
    previousSchedule: { type: Schema.Types.Mixed },
    newSchedule: { type: Schema.Types.Mixed },
    affectedFacultyIds: [{ type: String }],
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

export const TimetableHistoryModel = mongoose.model<ITimetableHistory>('TimetableHistory', TimetableHistorySchema);
