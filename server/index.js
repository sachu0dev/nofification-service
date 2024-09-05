import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getSockets } from "./lib/helper.js";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { socketAuthenticator } from "./middlewares/auth.js";
import { rateLimit } from 'express-rate-limit'
import { connectDB } from './lib/features.js';
import { admin } from './kafka/admin.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000", "http://localhost:5000", process.env.CLIENT_URL],
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

app.use(limiter)

app.set("io", io)
const userSocketIDs = new Map();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:5000", process.env.CLIENT_URL],
  credentials: true,
}));

const port = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI);

await admin();
// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// io.use((socket, next) => {
//   cookieParser()(socket.request, socket.request.res, async (err) => {
//     await socketAuthenticator(err, socket, next);
//   });
// });

// Socket.IO connection
const userid = 0;
io.on("connection", (socket) => {
  const user = {_id : userid++};
  if(user) {
    userSocketIDs.set(user._id.toString(), socket.id.toString());
  }

  socket.on("NOTIFICATION", async ({ users, message }) => {
    

    const membersSockets = getSockets(users);
    console.log("membersSockets", membersSockets);


    io.to(membersSockets).emit(NEW_MESSAGE, {
      message: messageForRealTime,
      chatId,
    });
    io.to(membersSockets).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.user.name);
    userSocketIDs.delete(user._id.toString());
  });
});

// Error Middleware
app.use(errorMiddleware);

// Start Server
server.listen(port, () => {
  console.log(`Server started on port: ${port} in ${process.env.NODE_ENV} mode`);
});

export { userSocketIDs };