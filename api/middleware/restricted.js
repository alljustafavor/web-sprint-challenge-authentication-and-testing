const jwt = require("jsonwebtoken");

const restricted = (req, res, next) => {
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.user_id,
      username: decoded.username
    };
  } catch (error) {
    res.status(401).json({ message: "token invaild" });
    next(error);
  }
}

module.exports = restricted;
