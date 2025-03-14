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
    // Filtrer les raretés disponibles
    const availableRarities = Object.keys(cardsData).filter(
      (rarity) => cardsData[rarity] && cardsData[rarity].length > 0
    );

    if (availableRarities.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Aucune carte disponible." });
    }

    // Définir les probabilités ajustées en fonction des raretés disponibles
    const baseProbabilities = {
      ultraRareCard: PROBA_ULTRA_RARE,
      rareCard: PROBA_RARE,
      communeCard: 1, // Si aucune autre carte n'est choisie, on prend une commune
    };

    // Créer les probabilités ajustées
    let totalProbability = availableRarities.reduce(
      (sum, rarity) => sum + (baseProbabilities[rarity] || 0),
      0
    );
    let cumulativeProbability = 0;

    const probabilities = availableRarities.map((rarity) => {
      cumulativeProbability += baseProbabilities[rarity] / totalProbability;
      return { rarity, threshold: cumulativeProbability };
    });

    // Générer un nombre aléatoire et déterminer la rareté correspondante
    const randomNumber = Math.random();
    const selectedRarity = probabilities.find(
      (p) => randomNumber < p.threshold
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

const migrateCard = async (req, res) => {
  const { idOrganisation, idCollection } = req.body;

  // Mapping des anciens titres aux nouveaux IDs
  const cardMapping = {
    "000": "-OL-kTPAmwYPBavVZE3o",
    "001": "-OL-kaPfnVvtDG1Pi5no",
    "002": "-OL-kkLzPT6jnYmy3DJp",
    "003": "-OL-knJdaeiM3nFYH_aE",
    "004": "-OL-kqOapEZlwKASx9hn",
    "005": "-OL-l-LeRNzD2thbUcQH",
    "006": "-OL-l29Xn54Eivmx3RQX",
    "007": "-OL-l4fkEPwrliPtJAAV",
    "008": "-OL-lBaLCEdV8AqU-Jcz",
    "009": "-OL-lE0OBzoAAnD7Y8Kj",
    "010": "-OL-lGW9pR89kwI40buo",
    "011": "-OL-lPz6t7HJ3mZndW8r",
    "012": "-OL-lSlUp3NjxX4eWA8w",
    "013": "-OL-lVgJcv4zjDYxuzDn",
    "014": "-OL-lYRiZkzNIBFYV7WB",
    "015": "-OL-laCPL0uZm5SzCQSN",
    "016": "-OL-ldemRyatckbKoOxd",
    "017": "-OL-lgTUd-Ba8sRe6dTF",
    "018": "-OL-lj1ebyohZyHoOyWs",
    "019": "-OL-llbVLYqU4eTSXyMp",
    "020": "-OL-loyBeNQ-oJKJdooL",
    "021": "-OL-lsEhLj_DIqneiaJ1",
    "023": "-OL-lv1adqVbfhqAAkWa",
    "024": "-OL-lyWLmVLF9e1yjCnG",
    "025": "-OL-m-xX_mayXSKOclhh",
    "026": "-OL-m2qKuD0WTeOtvvOs",
    "022": "-OL-m6tT7q8PYvlwrXt_",
  };

  try {
    const usersRef = db.ref(`organisations/${idOrganisation}/users`);
    const usersSnapshot = await usersRef.once("value");
    const usersData = usersSnapshot.val();

    if (!usersData) {
      return res
        .status(404)
        .json({ success: false, message: "Aucun utilisateur trouvé." });
    }

    for (const userId in usersData) {
      const userCollectionRef = db.ref(
        `organisations/${idOrganisation}/users/${userId}/collection`
      );
      const userCollectionSnapshot = await userCollectionRef.once("value");
      const userCollection = userCollectionSnapshot.val();

      if (!userCollection) continue;

      const updates = {};
      updates[idCollection] = {}; // Créer le dossier idCollection sous collection

      for (const oldTitle in userCollection) {
        const newId = cardMapping[oldTitle];
        if (newId) {
          updates[idCollection][newId] = userCollection[oldTitle];
          updates[idCollection][newId].title = newId;
        }
      }

      await userCollectionRef.set(updates);
    }

    res
      .status(200)
      .json({ success: true, message: "Migration terminée avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la migration des cartes :", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  openPack,
  openPackNew,
  getCards,
  migrateCard,
};
