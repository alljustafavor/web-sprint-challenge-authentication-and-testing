const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const restricted = require('./middleware/restricted.js');

const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/jokes', restricted, jokesRouter);

server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "An unexpected error occurred"
  });
});

module.exports = server;
