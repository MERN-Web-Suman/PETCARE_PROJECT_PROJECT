import { io } from "socket.io-client";

// Connect to the backend server (run this in e:/Collage_project/server)
const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("Test Script Connected. Emitting SOS...");
  
  socket.emit("sos-alert", {
    phone: "123-456-7890",
    locationInfo: { city: "Test City" }
  });

  setTimeout(() => {
    console.log("SOS Emitted! Exiting.");
    process.exit(0);
  }, 1000);
});

socket.on("connect_error", (err) => {
  console.log("Connection Error:", err.message);
  process.exit(1);
});
