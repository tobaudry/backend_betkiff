const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const authRoutes = require("./auth");
const betsRoutes = require("./bets");
const usersRoutes = require("./users");
const cardRoutes = require("./card");
const organisationRoutes = require("./organisations");

// Initialisation de Firebase Admin SDK
admin.initializeApp();

const app = express();

// Middleware CORS
app.use(cors({ origin: true }));

// Utilisation des routes
app.use("/auth", authRoutes);
app.use("/bets", betsRoutes);
app.use("/users", usersRoutes);
app.use("/card", cardRoutes);
app.use("/organisations", organisationRoutes);

// Fonction qui sera exportée pour Vercel
module.exports = (req, res) => {
  app(req, res);
};
