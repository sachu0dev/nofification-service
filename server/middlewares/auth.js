import jwt from 'jsonwebtoken';
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";



const socketAuthenticator = async (err, socket, next) => {  
  try {
    if (err) return next(new ErrorHandler("Please Login to access this resource", 401));
    const authToken = socket.request.cookies["token"];
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return next(new ErrorHandler("Please Login to access this resource", 401));
    socket.user = {
      _id: 1,
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
};

export {  socketAuthenticator };