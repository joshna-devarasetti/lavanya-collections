const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lavanya_collections';
  
  try {
    // Attempt standard connection first with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to external MongoDB successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] External MongoDB connection failed (${err.message}).`);
    console.log('[Database] Initializing embedded in-memory MongoDB server for development/demo mode...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB successfully: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] Mongoose disconnected');
  });
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, closeDB };
