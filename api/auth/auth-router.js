const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../users/users-model");

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    } 

    const username_taken = await User.find_by_username(username);
    if (username_taken) {
      return res.status(400).json({ message: "username taken" });
    }
    
    const user = await User.create({ username, password });
    res.status(201).json({
      id: user.id,
      username: user.username,
      password: user.password,
    }); 
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
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
      user_id: user.id,
      username: user.username
    },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: `welcome, ${user.username}`,
      token,
    });
  } catch (error) {
    next(error) 
  }
});

module.exports = router;
