const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Ticket must have a title
    },
    description: {
      type: String,
      required: true, // Ticket must have a description
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'], // Valid priority levels
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'], // Valid statuses
      default: 'Open',
    },
    assignedTo: {
      type: String, // Represents the user/employee assigned to this ticket
      default: 'Unassigned',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
