const express = require("express");

const routes = require("./routes");

require('dotenv').config();

const server = express();
server.use(express.json());

server.use(routes);

module.exports = server;
