const admin = require("firebase-admin");

const db = admin.database();


const getUsersMailByOrgansiation = async (idOrganisation) => {
  console.log("idOrganisation", idOrganisation); 
  const dbPath = `organisations/${idOrganisation}/users`;
  try {
    const usersSnapshot = await db.ref(dbPath).once("value");
    const users = usersSnapshot.val();
    const emails = Object.values(users).map(user => user.email);
    console.log("emails", emails);
    return emails;
  } catch (error) {
    console.error("Erreur lors de la récupération des emails :", error);
    throw new Error("Erreur serveur.");
  }
};



// Ajouter un pari
const addBets = async(req, res) => {
  const { path, data } = req.body;
  if (!path || !data) {
    return res
      .status(400)
      .send("Le corps de la requête doit contenir path et data");
  }

  const newBetRef = db.ref(path).push();

  
  // Ajout de l'ID généré dans les données
  const betWithId = {
    ...data,
    idBet: newBetRef.key,
  };

  newBetRef
    .set(betWithId)
    .then(() =>
      res
        .status(200)
        .send(`${path} ajouté avec succès avec ID ${newBetRef.key}!`),
    )
    .catch((error) => {
      console.error("Erreur Firebase :", error);
      res.status(500).send(error.message);
    });
  
    try{
      const idOrganisation = "-OIMMMEbw-_zOxRY6pYD";
      const emails = await getUsersMailByOrgansiation(idOrganisation);
    
      // Préparer l'email
      const emailData = {
        sender: { email: 'betkiff@gmail.com' },
        to: emails.map(email => ({ email })),
        subject: 'Nouveau pari ajouté !',
        htmlContent: `<html><body><p>Un nouveau pari a été ajouté !</p></body></html>`,
      };
    
      await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
        headers: {
          'api-key': process.env.SENDINBLUE_API_KEY,  // Remplace avec ta clé API Brevo
          'Content-Type': 'application/json',
        },
      });
    
      // Réponse de succès
      res.status(200).send(`Pari ajouté avec succès et email envoyé aux utilisateurs avec ID ${newBetRef.key}!`);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).send(error.message);
    }
};


// récuperer les paris
const getBets = (req, res) => {
  const { idOrganisation } = req.body;
  const dbPath = `organisations/${idOrganisation}/bets`;
  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const bets = snapshot.val();
      if (!bets) {
        return res.status(404).json({ message: "Aucun pari trouvé." });
      }
      res.status(200).json(bets);
    })
    .catch((error) => res.status(500).send(error.message));
};

// récupérer les mini paris
const getMiniBets = (req, res) => {
  const { idOrganisation } = req.body;
  const dbPath = `organisations/${idOrganisation}/miniBets`; // Chemin vers les mini paris
  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const bets = snapshot.val();
      if (!bets) {
        return res.status(404).json({ message: "Aucun pari trouvé." });
      }
      res.status(200).json(bets);
    })
    .catch((error) => res.status(500).send(error.message));
};

// récupérer les flashs
const getFlash = (req, res) => {
  const { idOrganisation } = req.body;
  const dbPath = `organisations/${idOrganisation}/flash`; // Chemin vers les flashs
  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const bets = snapshot.val();
      if (!bets) {
        return res.status(404).json({ message: "Aucun pari trouvé." });
      }
      res.status(200).json(bets);
    })
    .catch((error) => res.status(500).send(error.message));
};

const checkUserViewedFlash = async (req, res) => {
  const { idBet, idUser, idOrganisation } = req.body;
  if (!idBet || !idUser) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure idUser et idBet.",
    });
  }
  try {
    const flashViewerRef = db.ref(
      `organisations/${idOrganisation}/flash/${idBet}/viewer/${idUser}`,
    );
    const flashSnapshot = await flashViewerRef.once("value");

    if (!flashSnapshot.exists()) {
      return res
        .status(200)
        .json({ error: "Utilisateur n'a pas vu le défi flash." });
    }
    res.status(200).json({ success: "L'utilisateur a déjà vu le défi flash." });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du viewing du flash :",
      error,
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// placer le pari
const placeBet = async (req, res) => {
  try {
    const { path, betId, userId, betAmount, outcome, selectedOdd } = req.body;
    console.log("path", path, betId);
    // Valider les données d'entrée
    if (!betId || !userId || !betAmount || !outcome || !selectedOdd) {
      return res
        .status(400)
        .json({ error: "Données manquantes ou invalides." });
    }

    const db = admin.database();

    // Récupérer la référence du pari
    const betRef = db.ref(`${path}/${betId}`);
    const betSnapshot = await betRef.once("value");
    const betData = betSnapshot.val();

    if (!betData) {
      return res.status(404).json({ error: "Pari introuvable." });
    }

    // Vérifier si le pari est ouvert
    if (!betData.bettingOpen) {
      return res
        .status(400)
        .json({ error: "Le pari n'est plus ouvert aux mises." });
    }

    // Ajouter l'utilisateur au noeud `bettors` avec ses détails
    const bettorData = {
      idUser: userId,
      betAmount,
      outcome,
      selectedOdd,
      datePlaced: new Date().toISOString(),
    };

    await betRef.child(`bettors/${userId}`).set(bettorData);

    res.status(200).json({
      message: "Pari enregistré avec succès.",
      betId,
      userId,
      betAmount,
      selectedOdd,
      outcome,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du pari :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const getBetById = (req, res) => {
  const { idBet } = req.params;
  const { path } = req.body; // Récupère l'idBet depuis les paramètres de la requête
  const dbPath = `${path}/${idBet}`; // Définit le chemin vers le pari spécifique dans Firebase

  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const bet = snapshot.val();
      if (!bet) {
        return res.status(404).json({ message: "Pari non trouvé." });
      }
      res.status(200).json(bet);
    })
    .catch((error) => res.status(500).send(error.message));
};

// Controller pour basculer le statut d'un pari
const toggleBettingStatus = (req, res) => {
  const { idBet } = req.params; // Récupère l'ID du pari à partir des paramètres de la requête
  const { idOrganisation } = req.body;
  const betRef = db.ref(`organisations/${idOrganisation}/bets/${idBet}`);
  let newStatus; // Déclare la variable ici pour qu'elle soit accessible plus tard

  // Lire le statut actuel
  betRef
    .once("value")
    .then((snapshot) => {
      const bet = snapshot.val();
      if (!bet) {
        console.log("Pari introuvable dans la base de données.");
        return res.status(404).json({ message: "Pari introuvable." });
      }

      newStatus = !bet.bettingOpen; // Définit la nouvelle valeur de statut

      console.log(
        `Ancien statut: ${bet.bettingOpen}, Nouveau statut: ${newStatus}`,
      );

      // Mettre à jour le statut
      return betRef.update({ bettingOpen: newStatus });
    })
    .then(() => {
      console.log("Statut mis à jour avec succès.");
      // Réponse avec statut mis à jour
      return res.status(200).json({
        message: "Statut mis à jour avec succès.",
        bettingOpen: newStatus,
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour :", error);
      // Vérifie que la réponse n'a pas déjà été envoyée
      if (!res.headersSent) {
        res.status(500).json({
          message: "Erreur interne du serveur.",
          error: error.message,
        });
      }
    });
};

// Mettre à jour un pari
const updateBets = async (req, res) => {
  const idBet = req.params.id;
  const { updatedData, idOrganisation } = req.body;

  try {
    // Référence à la collection 'bets' dans Firebase Realtime Database
    const betRef = db.ref(`organisations/${idOrganisation}/bets/${idBet}`);

    // Mise à jour des données
    await betRef.update(updatedData);

    res.status(200).json({
      message: "Pari mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du pari :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour du pari",
    });
  }
};

const markFlashAsViewed = async (req, res) => {
  const { idBet, idUser, idOrganisation } = req.body;
  if (!idBet || !idUser) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure idUser et idBet.",
    });
  }

  try {
    const flashViewerRef = db.ref(
      `organisations/${idOrganisation}/flash/${idBet}/viewer/${idUser}`,
    );

    // Mise à jour des données
    await flashViewerRef.update({
      viewed: true,
      timestamp: Date.now(),
    });

    res.status(200).json({ success: "view flash mise à jour avec succès." });
    console.log("Utilisateur enregistré comme ayant vu le défi");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const updateMiniBets = async (req, res) => {
  const { idBet } = req.params;

  const {
    date,
    odds,
    sportCategory,
    title,
    bettingStatus,
    distributeWinningDone,
    idOrganisation,
  } = req.body;

  try {
    const miniBetRef = db.ref(
      `organisations/${idOrganisation}/miniBets/${idBet}`,
    );

    // Vérifier si le mini pari existe
    const snapshot = await miniBetRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Mini pari non trouvé" });
    }

    // Mettre à jour les données
    await miniBetRef.update({
      date,
      odds,
      sportCategory,
      title,
      bettingStatus,
      distributeWinningDone,
    });

    res.status(200).json({ message: "Mini pari mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mini pari :", error);
    res
      .status(500)
      .json({ error: "Une erreur est survenue lors de la mise à jour" });
  }
};



const calculateWinningsCommon = async ({ bet, bettors, winningCriteria, betPath }) => {
  if (!winningCriteria) {
    throw new Error("Critère gagnant non spécifié.");
  }

  const winningBettors = [];
  for (const userId in bettors) {
    if (Object.prototype.hasOwnProperty.call(bettors, userId)) {
      const bettor = bettors[userId];
      const coteGagnante = bettor.selectedOdd;

      // Vérifier si le parieur a choisi le bon résultat ou la bonne cote
      if (bettor.outcome === winningCriteria) {
        const winnings = bettor.betAmount * coteGagnante;
        if (winnings > 0) {
          winningBettors.push({ idUser: userId, winnings });
        }
      }
    }
  }

  // 🔥 Mettre à jour Firebase avec la liste des gagnants
  if (betPath) {
    try {
      const betRef = db.ref(`organisations/${idOrganisation}/${betPath}/${idBet}`);

      await betRef.update( {
        distributeWinningDone: true,
        winningBettors: winningBettors,
      });

      console.log("Mise à jour Firebase réussie :", winningBettors);
    } catch (error) {
      console.error("Erreur mise à jour Firebase :", error);
    }
  }

  return winningBettors;
};


const calculateWinningsBets = async (req, res) => {
  const { bet, bettors } = req.body;

  if (!bet || !bettors) {
    return res
      .status(403)
      .json({ message: "Données invalides ou manquantes." });
  }

  const { score, matchStatus } = bet;

  if (matchStatus !== "terminé") {
    return res
      .status(400)
      .json({ message: "Le match n'est pas terminé, aucun calcul effectué." });
  }

  let winningCriteria = null;

  // Déterminer le critère gagnant (winTeam1, winTeam2, draw)
  if (score.team1 > score.team2) {
    winningCriteria = "winTeam1";
  } else if (score.team2 > score.team1) {
    winningCriteria = "winTeam2";
  } else {
    winningCriteria = "draw";
  }

  try {
    const winningBettors = await calculateWinningsCommon({
      bet,
      bettors,
      winningCriteria,
    });

    res.status(200).json({
      message: "Calcul des gains effectué avec succès.",
      winningBettors,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du calcul des gains.", error });
  }
};

const calculateWinningsMiniBets = async (req, res) => {
  const { bet, bettors, idBet, winningOdd } = req.body;
  if (!bet || !bettors || !idBet || !winningOdd) {
    return res
      .status(403)
      .json({ message: "Données invalides ou manquantes." });
  }

  try {
    const winningBettors = await calculateWinningsCommon({
      bet,
      bettors,
      winningCriteria: winningOdd,
      betPath:"miniBets"
    });

    res.status(200).json({
      message: "Les gains ont été distribués avec succès.",
      winningBettors,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du calcul des gains.", error });
  }
};

const deleteFlash = async (req, res) => {
  try {
    const { idBet, idOrganisation } = req.body; // Récupération de l'ID dans le corps de la requête

    if (!idBet) {
      return res.status(400).json({ error: "ID de flash manquant." });
    }

    const flashRef = db.ref(`organisations/${idOrganisation}/flash/${idBet}`);
    const snapshot = await flashRef.once("value");
    const flashData = snapshot.val();
    if (!flashData) {
      return res.status(404).json({ error: "Flash introuvable." });
    }

    await flashRef.remove();
    res.status(200).json({ message: "Flash supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du flash :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const pushUserInListAgreeFlash = async (req, res) => {
  const { idBet, idUser, idOrganisation } = req.body;
  if (!idBet || !idUser) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure idUser et idBet.",
    });
  }

  try {
    const flashParticipantRef = db.ref(
      `organisations/${idOrganisation}/flash/${idBet}/participant/${idUser}`,
    );

    // Mise à jour des données
    await flashParticipantRef.update({
      done : false,
    });

    res.status(200).json({ success: "view flash mise à jour avec succès." });
    console.log("Utilisateur enregistré comme ayant vu le défi");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

module.exports = {
  addBets,
  getBets,
  getMiniBets,
  getFlash,
  checkUserViewedFlash,
  placeBet,
  getBetById,
  updateBets,
  calculateWinningsBets,
  toggleBettingStatus,
  markFlashAsViewed,
  updateMiniBets,
  calculateWinningsMiniBets,
  deleteFlash,
  pushUserInListAgreeFlash,
};
