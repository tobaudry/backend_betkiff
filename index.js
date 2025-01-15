const admin = require("./Config/Firebase"); // Assurez-vous d'utiliser le bon chemin
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware pour gérer les CORS
app.use(cors({ origin: true }));

// Middleware pour parser le JSON dans les requêtes
app.use(express.json()); // <-- Ajoutez ceci

// Importer les routes
const usersRoutes = require("./routes/users");
const organisationRoutes = require("./routes/organisations");
const authRoutes = require("./routes/auth");
const betsRoutes = require("./routes/bets");
// const cardRoutes = require("./routes/card");

// Utiliser les routes
app.use("/users", usersRoutes);
app.use("/organisations", organisationRoutes);
app.use("/auth", authRoutes);
app.use("/bets", betsRoutes);
app.use("/card", cardRoutes);

// Exporter l'application comme une fonction Firebase ou pour Vercel (serverless)
module.exports = app;
