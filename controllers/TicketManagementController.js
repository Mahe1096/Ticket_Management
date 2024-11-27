const Ticket = require('../models/Ticket');
const axios = require('axios');
const rabbitmqProducer = require('../services/rabbitmqProducer');

const saveNotification = async (req, userId, email, message, ticketId = null) => {
  try {
    const notification = {
      userId,
      email,
      message,
      status: 'pending', // Default status when notification is saved
      createdAt: new Date(),
      ticketId, // Optional: Link notification to a ticket if provided
    };

    // POST request to save notification via API
    await axios.post('http://host.docker.internal:5000/api/notifications', notification, {
      headers: {
        Authorization: `${req.headers.authorization}` // Assuming token is passed in the request header
      }
    });
    console.log('Notification saved successfully.');
  } catch (error) {
    console.error('Failed to save notification:', error.message);
  }
}

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;
    let user=undefined;
    // Check if the assigned user exists
    if(assignedTo){
      // Fetch the user from your user service with Authorization token in header
      const userResponse = await axios.get(`http://host.docker.internal:5000/api/auth/user/${assignedTo}`, {
        headers: {
          Authorization: `${req.headers.authorization}` // Ensure the token is included in the Authorization header
        }
      });
      user = userResponse.data;

      if (!user) {
        return res.status(400).json({ message: 'Assigned user does not exist.' });
      }
    }

    const ticket = new Ticket({ title, description, priority, status, assignedTo });
    const savedTicket = await ticket.save();
    // Payload for RabbitMQ
    if(user!=undefined){
      const payload = {
        email: user.email,
        message: `Your ticket #${savedTicket._id} has been created.`,
        ticket: { ...savedTicket._doc, user },
      };
      // Send payload to RabbitMQ
      await rabbitmqProducer.sendMessage('ticket_notifications', payload);
      await saveNotification(req, user._id, user.email, `Your ticket #${savedTicket._id} has been created.`, savedTicket._id);
    }

    

    res.status(201).json(savedTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get all tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);
    let user=undefined;

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    if(assignedTo){
    // Check if the assigned user exists
    const userResponse = await axios.get(`http://host.docker.internal:5000/api/auth/user/${assignedTo}`, {
      headers: {
        Authorization: `${req.headers.authorization}` // Ensure the token is included in the Authorization header
      }
    });
    user = userResponse.data;

      if (!user) {
        return res.status(400).json({ message: 'Assigned user does not exist.' });
      }
   }
    // Update ticket fields
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority = priority || ticket.priority;
    ticket.status = status || ticket.status;
    ticket.assignedTo = assignedTo || ticket.assignedTo;

    const updatedTicket = await ticket.save();

    // Payload for RabbitMQ
    if(user!=undefined){
      const payload = {
        email: user.email,
        message: `Your ticket #${updatedTicket._id} has been updated.`,
        ticket: { ...updatedTicket._doc, user },
      };
      // Send payload to RabbitMQ
      await rabbitmqProducer.sendMessage('ticket_notifications', payload);
      await saveNotification(req, user._id, user.email, `Your ticket #${updatedTicket._id} has been updated.`, updatedTicket._id);
    }

    

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: error.message });
  }
};


// Delete a ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search tickets by title
const searchTickets = async (req, res) => {
  try {
    const query = req.query.q || '';
    const tickets = await Ticket.find({
      title: { $regex: query, $options: 'i' },
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Paginate tickets
const getPaginatedTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const tickets = await Ticket.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalTickets = await Ticket.countDocuments();

    res.status(200).json({
      totalTickets,
      currentPage: page,
      totalPages: Math.ceil(totalTickets / limit),
      tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Filter tickets by status
const filterTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: "Status query is required" });
    }

    const tickets = await Ticket.find({ status });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Count all tickets
const countTickets = async (req, res) => {
  try {
    const count = await Ticket.countDocuments();
    res.status(200).json({ totalTickets: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  searchTickets,
  getPaginatedTickets,
  filterTicketsByStatus,
  countTickets,
};
