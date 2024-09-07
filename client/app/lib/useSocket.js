import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export const useSocket = (url) => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    socket = io(url, {
      withCredentials: true,
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("Socket connected: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for NOTIFICATION event
    socket.on("NOTIFICATION", (data) => {
      console.log("Received NOTIFICATION: ", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  return socketInstance;
};
