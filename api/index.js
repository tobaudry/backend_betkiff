const express = require('express');
const cors = require('cors');

const app = express();

// Utilisation de CORS
app.use(cors({ origin: true }));

// Exemple d'une route simple de test
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Démarrer le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
