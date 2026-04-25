import mongoose from "mongoose";

const MONGO_OPTS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  family: 4, // Force IPv4 to prevent intermittent IPv6 TLS drops with Atlas
};

let isConnecting = false;

const connectDB = async (retries = 5, delay = 3000) => {
  if (isConnecting) return;
  if (mongoose.connection.readyState === 1) return; // already connected

  isConnecting = true;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri, MONGO_OPTS);
      console.log("✅ MongoDB Connected");
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        console.log(`⏳ Retrying in ${delay / 1000}s…`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error("❌ All MongoDB connection attempts failed. Server will run but DB calls may fail.");
      }
    }
  }
  isConnecting = false;
};

// Register connection events only once
mongoose.connection.on("disconnected", () => {
  if (!isConnecting) {
    console.warn("⚠️  MongoDB disconnected — attempting reconnect…");
    setTimeout(() => connectDB(3, 5000), 2000);
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

export default connectDB;

