const admin = require("../Config/Firebase"); // Assurez-vous d'utiliser le bon chemin

// Référence à la base de données Firebase
const db = admin.database();

const testFunction = (req, res) => {
  res.status(200).json({ message: "test réussi" });
};

// Récupérer des utilisateurs
const getUsers = (req, res) => {
  const { idOrganisation } = req.body;
  const dbPath = `organisations/${idOrganisation}/users`;
  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      const users = snapshot.val();
      if (!users) {
        return res.status(404).json({ message: "Aucun utilisateurs trouvé." });
      }
      res.status(200).json(users);
    })
    .catch((error) => res.status(500).send(error.message));
};

const saveUserToken = async (req, res) => {
  const { userId, token, idOrganisation } = req.body;
  if (!userId || !token || !idOrganisation) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure userId et token et idOrganisation.",
    });
  }
  try {
    await db.ref(`organisations/${idOrganisation}/users/${userId}`).update({ fcmToken: token });
    res.status(200).json({ success: "Token mise à jour avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Failed to save token" });
  }
};

const getUserById = (req, res) => {
  const { idOrganisation } = req.body;
  const { uid } = req.params;
  console.log("id et uid", idOrganisation, uid);
  const dbPath = `organisations/${idOrganisation}/users/${uid}`; // Chemin vers l'utilisateur spécifique

  db.ref(dbPath)
    .once("value")
    .then((snapshot) => {
      if (!snapshot.exists()) {
        // Si aucune donnée n'existe pour cet UID
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      const user = snapshot.val();
      res.status(200).json(user); // Renvoie les données de l'utilisateur
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération de l'utilisateur :",
        error.message,
      );
      res.status(500).send(error.message); // En cas d'erreur
    });
};

const updateUserMoney = async (req, res) => {
  const { userId, newMoney, idOrganisation } = req.body;

  if (!userId || newMoney == null) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure userId et newMoney.",
    });
  }

  try {
    const userRef = admin
      .database()
      .ref(`organisations/${idOrganisation}/users/${userId}`);
    const userSnapshot = await userRef.once("value");

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Mettre à jour `nbMonnaie`
    await userRef.update({ nbMonnaie: newMoney });

    res.status(200).json({ success: "Monnaie mise à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la monnaie :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const updateUserLastOpening = async (req, res) => {
  const { userId, newLastOpening, idOrganisation } = req.body;
  if (!userId || newLastOpening == null) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure userId et newMoney.",
    });
  }
  try {
    const userRef = db.ref(`organisations/${idOrganisation}/users/${userId}`);
    const userSnapshot = await userRef.once("value");

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "Utilisateur introuvable. " });
    }

    await userRef.update({ last_opening: newLastOpening });

    res.status(200).json({ success: "Last Opening mise à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de last opening :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const updateStatut = async (req, res) => {
  const { idUser, newStatus, idOrganisation } = req.body;

  // Vérifier si le statut est valide
  if (newStatus !== "admin" && newStatus !== "utilisateur") {
    return res.status(400).json({
      message: "Status invalide, choisissez entre 'admin' ou 'utilisateur'",
    });
  }

  if (!idUser || newStatus == null) {
    return res.status(400).json({
      error: "Données manquantes. Assurez-vous d'inclure userId et newMoney.",
    });
  }

  try {
    const userRef = db.ref(`organisations/${idOrganisation}/users/${idUser}`);

    // Vérifier si l'utilisateur existe avant de mettre à jour
    const snapshot = await userRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }

    // Mise à jour du statut dans la base de données
    await userRef.update({ statusUser: newStatus });

    return res.status(200).json({ message: "Statut mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { idOrganisation } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ error: "L'identifiant de l'utilisateur est requis." });
  }

  try {
    const userInOrganisationRef = db.ref(
      `organisations/${idOrganisation}/users/${userId}`,
    );
    await userInOrganisationRef.remove(); // Appeler remove sur la référence spécifique à l'utilisateur

    const userRef = db.ref(`users/${userId}`);
    await userRef.remove();

    return res
      .status(200)
      .json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    return res.status(500).json({
      error: "Une erreur est survenue lors de la suppression de l'utilisateur.",
    });
  }
};

const getIdOrgaByIdUser = async (req, res) => {
  const { idUser } = req.params;
  try {
    // Référence à la table utilisateur
    const usersRef = db.ref(`users/${idUser}`);
    const snapshot = await usersRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Récupération de l'idOrganisation
    const userData = snapshot.val();
    console.log("userdata", userData);
    const idOrganisation = userData.idOrganisation;

    if (!idOrganisation) {
      return res.status(404).json({
        error: "Aucune organisation non trouvé pour cet utilisateur.",
      });
    }

    // Envoi de l'idOrganisation
    res.status(200).json({ idOrganisation });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'idOrganisation :",
      error,
    );
    res.status(500).json({ error: "Erreur serveur." });
  }
};

module.exports = {
  getUsers,
  testFunction,
  getUserById,
  updateUserMoney,
  updateUserLastOpening,
  updateStatut,
  deleteUser,
  getIdOrgaByIdUser,
  saveUserToken,
};
