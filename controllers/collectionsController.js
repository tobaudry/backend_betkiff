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

    // Référence vers la liste des URLs dans Firebase
    const urlsRef = db.ref(path);

    // Récupérer la liste des URLs existantes
    const snapshot = await urlsRef.once("value");
    const existingUrls = snapshot.val() || {}; // Si aucun URL existant, on initialise un objet vide

    // Ajouter l'URL à la liste, en utilisant un index basé sur la taille de la liste
    const newIndex = Object.keys(existingUrls).length;
    existingUrls[newIndex] = url; // Ajouter l'URL à la fin de la liste

    // Mettre à jour la liste dans Firebase
    await urlsRef.set(existingUrls);

    console.log("URL d'image ajoutée avec succès :", url);
    return res.status(200).json({
      message: "URL d'image ajoutée avec succès.",
      url,
    }); // ✅ Renvoie un JSON avec l'URL
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
  addUrl,
};
