const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rabbitmqProducer = require('./services/rabbitmqProducer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

//rabbitMQ connection
(async () => {
  await rabbitmqProducer.connect(); // Connect to RabbitMQ at server start
})();


// Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Ticket Management Service running on port ${PORT}`);
});
