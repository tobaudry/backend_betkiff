const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp(); // Initialise Firebase Admin SDK

const app = express();

// Middleware pour gérer les CORS
app.use(cors({ origin: true }));

// Importer les routes
const usersRoutes = require("./routes/users");

// Utiliser les routes
app.use("/users", usersRoutes);

// Définir le port d'écoute
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
