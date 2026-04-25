import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petcare';

async function dropIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'clinics' }).toArray();
    
    if (collections.length > 0) {
      console.log('Dropping index provider_1 from clinics collection...');
      try {
        await db.collection('clinics').dropIndex('provider_1');
        console.log('Index dropped successfully');
      } catch (e) {
        if (e.codeName === 'IndexNotFound' || e.message.includes('index not found')) {
          console.log('Index provider_1 not found, nothing to drop.');
        } else {
          throw e;
        }
      }
    } else {
      console.log('Clinics collection does not exist yet.');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Error dropping index:', err);
    process.exit(1);
  }
}

dropIndex();
