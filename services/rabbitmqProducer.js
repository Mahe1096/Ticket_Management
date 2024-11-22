const amqp = require('amqplib');

let channel, connection;

// Initialize RabbitMQ connection
const connect = async () => {
  try {
    connection = await amqp.connect('amqp://host.docker.internal'); // Replace with your RabbitMQ URL
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
};

// Send a message to the specified queue
const sendMessage = async (queue, message) => {
  if (!channel) await connect();

  try {
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to queue "${queue}":`, message);
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
  }
};

// Graceful shutdown
const close = async () => {
  try {
    await channel.close();
    await connection.close();
    console.log('RabbitMQ connection closed.');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

process.on('exit', close);

module.exports = { sendMessage, connect };
