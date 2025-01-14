const express = require('express');
const cors = require('cors');

const app = express();

// Utilisation de CORS
app.use(cors({ origin: true }));

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
