const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

// Configurer Multer pour gérer les fichiers
const upload = multer({ storage: multer.memoryStorage() });

// Initialiser le routeur
const router = express.Router();

// Route pour uploader une image sans l'enregistrer dans la base de données
router.post(
  "/uploadImage",
  upload.single("image"),
  uploadController.uploadImage
);

// Exporter le routeur
module.exports = router;
