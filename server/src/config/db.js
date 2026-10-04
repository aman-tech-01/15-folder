import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcampus';
  
  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Initializing embedded database memory server...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to Embedded MongoDB at ${inMemoryUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Failed to start embedded MongoDB:', fallbackErr);
      throw fallbackErr;
    }
  }
};
