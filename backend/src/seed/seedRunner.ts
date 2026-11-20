import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { store } from '../services/store.js';
import { UserModel } from '../models/User.js';
import { DepartmentModel } from '../models/Department.js';
import { FacultyModel } from '../models/Faculty.js';
import { CourseModel } from '../models/Course.js';
import { ClassroomModel } from '../models/Classroom.js';
import { TimetableModel } from '../models/Timetable.js';
import { TimetableEntryModel } from '../models/TimetableEntry.js';
import { HistoricalTimetableModel } from '../models/HistoricalTimetable.js';
import { NotificationModel } from '../models/Notification.js';

dotenv.config();

export const runSeed = async () => {
  console.log('[Seeder] Starting SmartSched institutional data seed...');
  const isConnected = await connectDatabase();

  if (isConnected) {
    console.log('[Seeder] Connected to MongoDB. Seeding collections...');
    try {
      // Clear existing
      await Promise.all([
        UserModel.deleteMany({}),
        DepartmentModel.deleteMany({}),
        FacultyModel.deleteMany({}),
        CourseModel.deleteMany({}),
        ClassroomModel.deleteMany({}),
        TimetableModel.deleteMany({}),
        TimetableEntryModel.deleteMany({}),
        HistoricalTimetableModel.deleteMany({}),
        NotificationModel.deleteMany({}),
      ]);

      const state = store.getInitialState();

      await UserModel.insertMany(state.users);
      await DepartmentModel.insertMany(state.departments);
      await FacultyModel.insertMany(state.faculty);
      await CourseModel.insertMany(state.courses);
      await ClassroomModel.insertMany(state.classrooms);
      await TimetableModel.insertMany(state.timetables);
      await TimetableEntryModel.insertMany(state.timetableEntries);
      await HistoricalTimetableModel.insertMany(state.historicalRecords);
      await NotificationModel.insertMany(state.notifications);

      console.log('✅ [Seeder] Successfully seeded MongoDB with institutional records.');
    } catch (e: any) {
      console.error('[Seeder] MongoDB insert error:', e.message);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    console.log('ℹ️ [Seeder] Standalone mode active: In-Memory Institutional Data Store initialized with seed records.');
  }

  console.log('[Seeder] Seed process complete.');
};

runSeed();
