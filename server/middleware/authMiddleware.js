const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Invalid Authorization format' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

module.exports = authMiddleware;
