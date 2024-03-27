#!/usr/bin/env node

require("gentls");

const express = require("express");
const https = require("https");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl/default.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/default.crt")),
};

const server = https.createServer(httpsOptions, app);
const io = socketIo(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });
});

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Serveur HTTPS démarré sur le port ${PORT}`)
);
