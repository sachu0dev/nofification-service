import { kafka } from "./client.js";
import { io, userSocketIDs } from '../index.js';
import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const pushSubscriptions = new Map();

async function consumeNotification() {
  const consumer = kafka.consumer({ groupId: 'notification-default-group' });

  try {
    console.log("Connecting Consumer...");
    await consumer.connect();
    console.log("Consumer Connected Successfully");

    await consumer.subscribe({ topic: 'NOTIFICATION', fromBeginning: false });

    console.log("Consumer Subscribed to NOTIFICATION topic");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key.toString();
        const value = message.value.toString();
        const parsedMessage = JSON.parse(value);

        console.log(`Received message from topic "${topic}" with key "${key}" and value "${value}"`);

        const { users, message: notificationMessage } = parsedMessage;

        const userSocketIDsArray = users.map(user => userSocketIDs.get(user.toString()));

        console.log(userSocketIDsArray);

        userSocketIDsArray.forEach(socketId => {
          if (socketId) {
            // Send Socket.IO notification
            io.to(socketId).emit('NOTIFICATION', { message: notificationMessage });
            console.log(`Socket.IO notification sent to user with socketId: ${socketId}`);

            // Send Web Push notification
            const pushSubscription = pushSubscriptions.get(socketId);
            if (pushSubscription) {
              const payload = JSON.stringify({
                title: 'New Notification',
                body: notificationMessage,
                icon: '/icon.png'
              });

              webpush.sendNotification(pushSubscription, payload)
                .then(() => console.log(`Web Push notification sent to user with socketId: ${socketId}`))
                .catch(err => console.error(`Error sending Web Push notification to ${socketId}:`, err));
            }
          }
        });
      },
    });
  } catch (err) {
    console.error("Error connecting consumer:", err);
  }
}

function storePushSubscription(socketId, subscription) {
  pushSubscriptions.set(socketId, subscription);
  console.log(`Push subscription stored for socketId: ${socketId}`);
}

export { consumeNotification, storePushSubscription, vapidKeys };