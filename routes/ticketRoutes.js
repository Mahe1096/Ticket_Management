const express = require('express');
const {
    createTicket,
    getTickets,
    searchTickets,
    updateTicket,
    deleteTicket,
    getTicketById,
    getPaginatedTickets,
    filterTicketsByStatus,
    countTickets,
} = require('../controllers/TicketManagementController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new ticket
router.post('/', createTicket);

// Get all tickets
router.get('/', getTickets);

// Search tickets by query
router.get('/search', searchTickets);

// Get paginated tickets
router.get('/paginate', getPaginatedTickets);

// Filter tickets by status
router.get('/filter', filterTicketsByStatus);

// Count all tickets
router.get('/count', countTickets);

// Dynamic routes (must come after static routes)
// Get a ticket by ID
router.get('/:id', getTicketById);

// Update a ticket by ID
router.put('/:id', updateTicket);

// Delete a ticket by ID
router.delete('/:id', deleteTicket);

module.exports = router;
