async function init(times) {
  const producer = kafka.producer();
  try {
    console.log("Connecting Producer...");
    await producer.connect();
    console.log("Producer Connected Successfully");

      await producer.send({
        topic: "NOTIFICATION",
        messages: [
          {
            key: "NOTIFY",
            value: JSON.stringify({ users: [1,2,3,4], message: "Hello World!" }),
          },
        ],
      });
      console.log(
        `Successfully sent message to topic "NOTIFICATION" with key "NOTIFY" and value "${JSON.stringify({ users: [1,2,3,4], message: "Hello World!" })}"`
      );

    await producer.disconnect();
  } catch (err) {
    console.error("Error connecting producer:", err);
  }
}

export { init }