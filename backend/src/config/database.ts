import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartsched';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // fast failover if local daemon isn't running
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB successfully connected to ${uri}`);
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    console.warn(`[Database] Local MongoDB server connection failed: ${error.message}`);
    console.log(`[Database] Activating High-Performance In-Memory Institutional Data Store for standalone presentation demo mode.`);
    return false;
  }
};

export const getIsMongoConnected = () => isMongoConnected;
