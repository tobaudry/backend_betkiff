const admin = require("./Config/Firebase"); // Assurez-vous d'utiliser le bon chemin
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware pour gérer les CORS
app.use(cors({ origin: true }));

// Importer les routes
const usersRoutes = require("./routes/users");
const organisationRoutes = require("./routes/organisations");
const authRoutes = require("./routes/auth");

// Utiliser les routes
app.use("/users", usersRoutes);
app.use("/organisations", organisationRoutes);
app.use("/auth", authRoutes);


// Exporter l'application comme une fonction Firebase ou pour Vercel (serverless)
module.exports = app;
