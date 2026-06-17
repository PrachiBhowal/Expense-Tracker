const sessionMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in first' });
  }
  req.userId = req.session.userId;
  next();
};

module.exports = sessionMiddleware;