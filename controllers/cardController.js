const admin = require("firebase-admin");

const db = admin.database();

const PROBA_ULTRA_RARE = 0.05;
const PROBA_RARE = 0.25;

const PROBA_GOLD = 0.01;
const PROBA_OBJECT = 0.15;
const PROBA_PREZ = 0.3;

const openPack = async (req, res) => {
  const { idUser, cardsData, idOrganisation } = req.body;
  try {
    const randomNumber = Math.random();
    let drawnCard;
    if (randomNumber < PROBA_GOLD) {
      drawnCard =
        cardsData.goldCard[
          Math.floor(Math.random() * cardsData.goldCard.length)
        ];
    } else if (randomNumber < PROBA_OBJECT) {
      drawnCard =
        cardsData.objectCards[
          Math.floor(Math.random() * cardsData.objectCards.length)
        ];
    } else if (randomNumber < PROBA_PREZ) {
      drawnCard =
        cardsData.prezCards[
          Math.floor(Math.random() * cardsData.prezCards.length)
        ];
    } else {
      drawnCard =
        cardsData.possibleCards[
          Math.floor(Math.random() * cardsData.possibleCards.length)
        ];
    }

    // Références à la base de données
    const userRef = db.ref(
      `organisations/${idOrganisation}/users/${idUser}/collection`
    );
    const cardRef = db.ref(
      `organisations/${idOrganisation}/users/${idUser}/collection/${drawnCard.title}`
    );

    // Utilisez `once('value')` au lieu de `get()`
    const snapshot = await cardRef.once("value");

    if (snapshot.exists()) {
      const currentDoublon = snapshot.val().doublon || 1;
      await cardRef.update({ doublon: currentDoublon + 1 });
    } else {
      await userRef.update({
        [drawnCard.title]: { doublon: 1 },
      });
    }

    res.status(200).json({ success: true, card: drawnCard });
  } catch (error) {
    console.error("Erreur lors de l'ouverture du pack :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const openPackNew = async (req, res) => {
  const { idUser, cardsData, idOrganisation, idCollection } = req.body;

  try {
    const probabilities = [
      { rarity: "ultraRareCard", threshold: PROBA_ULTRA_RARE },
      { rarity: "rareCard", threshold: PROBA_RARE },
      { rarity: "communeCard", threshold: 1 }, // 100% de chances pour les communes si les autres échouent
    ];

    // Générer un nombre aléatoire
    const randomNumber = Math.random();

    // Trouver la rareté correspondante
    const selectedRarity = probabilities.find(
      (p, index) =>
        randomNumber < p.threshold || index === probabilities.length - 1
    ).rarity;

    // Sélectionner une carte aléatoire dans la catégorie choisie
    const drawnCard =
      cardsData[selectedRarity][
        Math.floor(Math.random() * cardsData[selectedRarity].length)
      ];

    if (!drawnCard) {
      return res
        .status(400)
        .json({ success: false, error: "Aucune carte disponible." });
    }

    // Références à la base de données
    const userRef = db.ref(
      `organisations/${idOrganisation}/users/${idUser}/collection/${idCollection}`
    );
    const cardRef = userRef.child(drawnCard.id);

    // Vérifier si la carte existe déjà et mettre à jour le compteur de doublons
    const snapshot = await cardRef.once("value");

    if (snapshot.exists()) {
      const currentDoublon = snapshot.val().doublon || 1;
      await cardRef.update({ doublon: currentDoublon + 1 });
    } else {
      await cardRef.set({ doublon: 1 });
    }

    res.status(200).json({
      success: true,
      card: {
        id: drawnCard.id,
        imageUrl: drawnCard.imageUrl,
        title: drawnCard.title,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture du pack :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCards = async (req, res) => {
  const { idOrganisation, idCollection } = req.body; // On récupère l'ID de la collection
  const dbPath = `organisations/${idOrganisation}/collections/${idCollection}`;

  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const collectionData = snapshot.val();

      if (!collectionData || collectionData.length === 0) {
        return res.status(400).json({ message: "Aucune carte trouvée." });
      }

      res.status(200).json({ collectionData });
    })
    .catch((error) => res.status(500).send(error.message));
};

module.exports = {
  openPack,
  openPackNew,
  getCards,
};
