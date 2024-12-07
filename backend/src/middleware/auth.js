const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify if token is in active sessions
    const validSession = user.activeSessions.find(session => session.token === token);
    if (!validSession) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Update last active
    validSession.lastActive = new Date();
    await user.save();

    req.user = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
