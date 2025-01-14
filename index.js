const admin = require("./Config/Firebase"); // Assurez-vous d'utiliser le bon chemin
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware pour gérer les CORS
app.use(cors({ origin: true }));

// Importer les routes
const usersRoutes = require("./routes/users");

// Utiliser les routes
app.use("/users", usersRoutes);

// Exporter l'application comme une fonction Firebase ou pour Vercel (serverless)
module.exports = app;
