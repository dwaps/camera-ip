const express = require("express");
const https = require("https");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

// Mise à jour des chemins vers le certificat SSL et la clé privée
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl/default.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/default.crt")),
};

// Créer le serveur HTTPS
const server = https.createServer(httpsOptions, app);

// Configurer Socket.io pour utiliser ce serveur
const io = socketIo(server);

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static("public"));

// Gérer les connexions WebSocket via Socket.io
io.on("connection", (socket) => {
  console.log("Un client est connecté:", socket.id);

  // Relay tous les messages reçus à tous les autres clients
  socket.on("message", (data) => {
    console.log("Relay message:", data);
    socket.broadcast.emit("message", data);
  });
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`Serveur HTTPS démarré sur le port ${PORT}`)
);
