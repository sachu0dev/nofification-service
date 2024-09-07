"use client";
import { useEffect, useState } from "react";
import { useSocket } from "./lib/useSocket";
import toast from "react-hot-toast";
import axios from "axios"; 
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/redux/notificationSlice";
import { registerServiceWorker } from "./lib/registerServiceWorker";

export default function Home() {
  const socket = useSocket("http://localhost:4000"); 
  const notifications = useSelector((state) => state.notification.notifications);
  const dispatch = useDispatch();
  
  const [message, setMessage] = useState("");

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleClick = async () => {
    try {
      const res = await axios.post("http://localhost:4000/send-notification", {
        message: message,
      });
      if (res.status === 200) {
        toast.success("Notification sent!");
      }
    } catch (error) {
      toast.error("Failed to send notification");
      console.error("Error sending notification:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("NOTIFICATION", (data) => {
        console.log("Received NOTIFICATION: ", data);
        dispatch(addNotification(data));
        
        // Request permission and send push notification
        if (Notification.permission === "granted") {
          navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification('New Notification', {
              body: data.message,
              icon: '/icon.png',
              badge: '/badge.png'
            });
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              navigator.serviceWorker.ready.then(function(registration) {
                registration.showNotification('New Notification', {
                  body: data.message,
                  icon: '/icon.png',
                  badge: '/badge.png'
                });
              });
            }
          });
        }

        toast.success(data.message);
      });

      return () => {
        socket.off("NOTIFICATION");
      };
    }
  }, [socket]);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        try {
          const response = await fetch('http://localhost:4000/vapidPublicKey');
          const { publicKey } = await response.json();

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });

          await fetch('http://localhost:4000/subscribe?socketId=' + socket.id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          });

          console.log('Push notification subscription successful');
        } catch (err) {
          console.error('Error subscribing to push notifications:', err);
        }
      });
    }
  }, [socket]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div>
        <h1>Notification</h1>
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)} 
          className="border-2 m-2 p-2"
        />
        <button onClick={handleClick}>Send Notification</button>
      </div>

      <ul className="">
        {notifications.map((notification, index) => (
          <li className="border-2 m-2 p-2 text-xl shadow-sm" key={index}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
}