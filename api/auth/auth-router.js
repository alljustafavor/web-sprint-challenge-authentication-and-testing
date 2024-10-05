const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../users/users-model.js');

const secret = process.env.JWT_SECRET || "shh";

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existing = await User.find_by_username(username);
    if (existing) {
      return res.status(400).json({ message: "username taken" });
    }

    const newUser = await User.create({ username, password });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = await User.find_by_username(username);
    if (!user || !(await User.verify_password(user, password))) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign({
      subject: user.id,
      username: user.username
    }, secret, { expiresIn: '1d' });

    res.json({
      message: `welcome, ${user.username}`,
      token
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
