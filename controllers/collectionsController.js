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
    const { path, url, rarity, idOrganisation, idCollection } = req.body;

    if (!path || !url || !rarity || !idOrganisation || !idCollection) {
      return res.status(400).json({
        message:
          "Le corps de la requête doit contenir 'path', 'url', 'rarity', 'idOrganisation' et 'idCollection'.",
      });
    }

    console.log("Requête reçue pour ajouter une URL d'image :", req.body);

    // 1️⃣ Ajouter l'URL à la base de données et récupérer son ID unique
    const newUrlRef = db.ref(path).push(); // Génère un ID unique
    await newUrlRef.set(url);
    const idCard = newUrlRef.key; // Récupération de l'ID généré

    // 2️⃣ Enregistrer la carte sous son ID dans la section de rareté
    const rarityRef = db.ref(
      `organisations/${idOrganisation}/collections/${idCollection}/${rarity}/${idCard}`
    );
    await rarityRef.set(idCard); // Stocke l'ID sous lui-même

    console.log(`Carte ${idCard} ajoutée avec succès dans la catégorie ${rarity}`);

    return res.status(200).json({
      message: "URL d'image ajoutée avec succès.",
      idCard, // Retourne l'ID généré
      url,
    });
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
