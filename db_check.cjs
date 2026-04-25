const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/petcare";

// Define a minimal schema for Pet to avoid importing the model which might fail
const PetSchema = new mongoose.Schema({
    name: String,
    owner: mongoose.Schema.Types.ObjectId
});

const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await Pet.countDocuments();
        console.log(`\nTotal Pets: ${count}`);
        
        const pets = await Pet.find({}).limit(10);
        console.log("\nSome Pets:");
        pets.forEach(p => {
            console.log(` - ${p.name} (Owner ID: ${p.owner})`);
        });

        // Check if any pets have NO owner
        const noOwner = await Pet.countDocuments({ owner: { $exists: false } });
        const nullOwner = await Pet.countDocuments({ owner: null });
        console.log(`\nPets with NO owner field: ${noOwner}`);
        console.log(`Pets with NULL owner field: ${nullOwner}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
