import { userSocketIDs } from "../index.js"



export const getSockets = (users = []) => {
  const sockets = users.map((user) => {
    const userId = user.toString(); 
    const socketId = userSocketIDs.get(userId);

    if (!socketId) {
      console.warn(`Socket ID not found for user: ${userId}`, userSocketIDs);
      return null;
    }

    return socketId.toString();
  }).filter(socketId => socketId);

  return sockets;
};
