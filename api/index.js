const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions');

const app = express();

// Utilisation de CORS
app.use(cors({ origin: true }));

// Exemple d'une route simple de test
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Export de la fonction Firebase
exports.api = functions.https.onRequest(app);
