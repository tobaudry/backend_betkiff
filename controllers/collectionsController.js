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
          .json({ message: "Aucune collection trouvée." });
      }

      // Filtrer les collections pour ne garder que celles qui ont
      // au moins 1 carte dans commune, rare et ultraRare
      const filteredCollections = {};

      Object.entries(collections).forEach(([collectionKey, collectionData]) => {
        // Sécurité : vérifier que collectionData contient bien les trois clés
        if (
          collectionData.commune &&
          collectionData.rare &&
          collectionData.ultraRare
        ) {
          // Vérifier qu'il y a au moins 1 carte dans chaque rareté
          const hasCommune = Object.keys(collectionData.commune).length > 0;
          const hasRare = Object.keys(collectionData.rare).length > 0;
          const hasUltraRare =
            Object.keys(collectionData.ultraRare).length > 0;

          if (hasCommune && hasRare && hasUltraRare) {
            filteredCollections[collectionKey] = collectionData;
          }
        }
      });

      // On renvoie seulement les collections filtrées
      res.status(200).json(filteredCollections);
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

    // Référence vers la liste des URLs dans Firebase
    const urlsRef = db.ref(path);

    // Ajouter l'URL à la liste, avec un uid généré automatiquement par Firebase
    const newUrlRef = urlsRef.push(); // Génère un UID unique automatiquement
    const cardId = newUrlRef.key; // Utiliser cet UID pour tout

    await newUrlRef.set(url);

    // Ajouter l'ID de la carte DANS LA RARETÉ avec le MÊME ID que l'image
    const rarityRef = db.ref(
      `organisations/${idOrganisation}/collections/${idCollection}/${rarity}/${cardId}`
    );
    await rarityRef.set(cardId); // Utilise l'ID de la carte comme clé

    console.log("URL d'image ajoutée avec succès :", url);
    return res.status(200).json({
      message: "URL d'image ajoutée avec succès.",
      url,
      cardId,
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
