const admin = require("firebase-admin");

const db = admin.database();

// Ajouter un pari
const addCollection = async (req, res) => {
  try {
    const { path, data } = req.body;

    if (!path || !data) {
      return res.status(400).json({
        message: "Le corps de la requête doit contenir 'path' et 'data'.",
      });
    }

    console.log("Requête reçue pour ajouter une collection :", req.body);

    const newCollectionRef = db.ref(path).push();
    const idCollection = newCollectionRef.key;

    // Ajout de l'ID généré dans les données
    const collectionWithId = {
      ...data,
      idCollection,
    };

    await newCollectionRef.set(collectionWithId);

    console.log("Collection ajoutée avec succès :", collectionWithId);
    return res.status(200).json({
      message: "Collection ajoutée avec succès.",
      idCollection,
    }); // ✅ Renvoie un JSON propre au lieu d'un texte brut.
  } catch (error) {
    console.error("Erreur Firebase :", error);
    return res.status(500).json({
      message: "Erreur lors de l'ajout dans Firebase.",
      error: error.message,
    });
  }
};

const getCollections = (req, res) => {
  const { idOrganisation } = req.body;
  const dbPath = `organisations/${idOrganisation}/collections`;
  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const collections = snapshot.val();
      if (!collections) {
        return res
          .status(404)
          .json({ message: "Aucune collection trouvée trouvé." });
      }
      res.status(200).json(collections);
    })
    .catch((error) => res.status(500).send(error.message));
};

const addUrl = async (req, res) => {
  try {
    const { path, url } = req.body;

    if (!path || !url) {
      return res.status(400).json({
        message: "Le corps de la requête doit contenir 'path' et 'url'.",
      });
    }

    console.log("Requête reçue pour ajouter une URL d'image :", req.body);

    const newImageRef = db.ref(path).push(); // Créer une nouvelle référence
    const idImage = newImageRef.key;

    // Ajouter l'URL de l'image dans la base de données
    const imageWithId = {
      idImage,
      url, // L'URL de l'image
      timestamp: admin.database.ServerValue.TIMESTAMP, // Optionnel : ajouter un timestamp pour garder la trace du moment de l'ajout
    };

    await newImageRef.set(imageWithId);

    console.log("URL d'image ajoutée avec succès :", imageWithId);
    return res.status(200).json({
      message: "URL d'image ajoutée avec succès.",
      idImage,
      url,
    }); // ✅ Renvoie un JSON avec l'ID de l'image et l'URL
  } catch (error) {
    console.error("Erreur Firebase :", error);
    return res.status(500).json({
      message: "Erreur lors de l'ajout de l'URL dans Firebase.",
      error: error.message,
    });
  }
};

module.exports = {
  addCollection,
  getCollections,
  addUrl, // Ajoute addUrl ici
};
