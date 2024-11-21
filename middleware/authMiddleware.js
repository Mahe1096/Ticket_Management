const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user ID from the token to req.user
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
};

module.exports = authMiddleware;
