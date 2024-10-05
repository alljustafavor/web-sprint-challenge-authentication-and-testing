const jwt = require("jsonwebtoken");

const restricted = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "token required" });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) {
    return res.status(401).json({ message: "token required" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.user_id,
      username: decoded.username
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "token invalid" });
  }
};

module.exports = restricted;
