import mongoose from "mongoose";

const connectDB = (url) => {
  mongoose.connect(url,{dbName: "kabutar"})
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('MongoDB Connection Error: ', err);
    process.exit(1);
  });
};


const emitEvent = (req, event, users, data) => {
  try {
    const io = req.app.get("io");
    if (!io) throw new Error("Socket.io instance not found");

    const userSockets = getSockets(users);
    if (userSockets.length === 0) {
      console.warn(`No valid socket IDs found for event ${event} and users: ${users.join(", ")}`);
      return;
    }

    io.to(userSockets).emit(event, data);
    console.log(`Event ${event} emitted to users: ${users.join(", ")}`);
  } catch (error) {
    console.error(`Failed to emit event ${event}:`, error);
  }
};


export { connectDB, emitEvent };