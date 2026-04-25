import mongoose from 'mongoose';
import Pet from './server/models/Pet.js';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/petcare";

async function checkPets() {
  await mongoose.connect(MONGO_URI);
  const pets = await Pet.find({}).limit(10);
  console.log("Total Pets found:", await Pet.countDocuments());
  pets.forEach(p => {
    console.log(`Pet: ${p.name}, Owner: ${p.owner}, Type: ${typeof p.owner}`);
  });
  
  const users = await User.find({}).limit(5);
  console.log("\nUsers:");
  users.forEach(u => {
    console.log(`User: ${u.name}, ID: ${u._id}`);
  });
  
  process.exit();
}

checkPets().catch(err => {
  console.error(err);
  process.exit(1);
});
