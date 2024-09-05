import { kafka } from "./client.js";



async function admin() {
  console.log("Connecting Admin...");
  const admin = kafka.admin();
  let connected = false;

  while (!connected) {
    try {
      console.log("Admin connecting...");
      await admin.connect();
      connected = true;
      console.log("Admin Connection Success...");

      console.log("Creating Topic [NOTIFICATION]");
      const result = await admin.createTopics({
        topics: [
          {
            topic: "NOTIFICATION",
            numPartitions: 1,
          },
        ],
      });
      console.log("Topic Created Success [NOTIFICATION]", result);
    } catch (error) {
      console.error("Error occurred:", error.message);
      if (error.response) {
        console.error("Kafka Response Error Details:", error.response);
      }
      console.log("Retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
    } finally {
      if (connected) {
        console.log("Disconnecting Admin...");
        await admin.disconnect();
      }
    }
  }
}

export { admin };
