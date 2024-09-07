import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getSockets } from "./lib/helper.js";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { socketAuthenticator } from "./middlewares/auth.js";
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './lib/features.js';
import { admin } from './kafka/admin.js';
import { consumeNotification } from './kafka/consumer.js';
import { kafka } from './kafka/client.js'; 

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000", process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100,
  standardHeaders: 'draft-7', 
  legacyHeaders: false,
})

app.use(limiter);
app.set("io", io);

const userSocketIDs = new Map();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000", process.env.CLIENT_URL],
  credentials: true,
}));

const port = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI);

await admin();
consumeNotification(); 

const producer = kafka.producer();

async function sendNotification(users, message) {
  try {
    await producer.connect();
    await producer.send({
      topic: "NOTIFICATION",
      messages: [
        {
          key: "NOTIFY",
          value: JSON.stringify({ users, message }),
        },
      ],
    });
    console.log("Notification sent to Kafka:", { users, message });
  } catch (err) {
    console.error("Error sending message to Kafka:", err);
  } finally {
    await producer.disconnect();
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  const socketId = req.query.socketId;

  storePushSubscription(socketId, subscription);

  res.status(201).json({ message: 'Push subscription stored' });
});

app.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/send-notification", async (req, res) => {
const users = [1, 2, 3, 4, 5, 6, 7,8];
const message = req.body.message;  
  await sendNotification(users, message);
  
  res.status(200).json({ success: true, message: "Notification sent!" });
});

let userid = 1;
io.on("connection", (socket) => {
  const user = {_id : userid++};
  userSocketIDs.set(user._id.toString(), socket.id.toString());

  console.log("Connected: " , user._id.toString(), socket.id.toString());

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.user?.name);
    userSocketIDs.delete(user._id.toString());
  });
});

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server started on port: ${port} in ${process.env.NODE_ENV} mode`);
});

export { userSocketIDs, io };
