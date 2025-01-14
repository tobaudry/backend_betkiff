const admin = require("firebase-admin");
const db = admin.database();
const auth = admin.auth();

// Inscription d'un utilisateur
// Inscription d'un utilisateur dans l'organisation
const registerAndAddUser = async (req, res) => {
  const { email, password, nomUser, idOrganisation } = req.body;

  if (!email || !password || !nomUser || !idOrganisation) {
    return res.status(400).json({
      message:
        "Email, mot de passe, pseudo et ID de l'organisation sont requis.",
    });
  }

  try {
    // Créer un utilisateur Firebase
    const userRecord = await auth.createUser({ email, password });
    const uid = userRecord.uid;

    // Enregistrer les données de l'utilisateur dans la base de données de l'organisation
    const userData = {
      email,
      nomUser,
      nbMonnaie: 20,
      statusUser: "Utilisateur",
      idUser: uid,
      idOrganisation,
    };

    // Ajouter l'utilisateur sous l'organisation
    await db.ref(`organisations/${idOrganisation}/users/${uid}`).set(userData);

    const userDataUserTable = {
      idUser: uid,
      idOrganisation,
    };

    await db.ref(`users/${uid}`).set(userDataUserTable);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé et ajouté à l'organisation avec succès.",
      user: { uid, email, nomUser },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l’utilisateur :", error);
    res.status(500).json({
      message: "Erreur lors de la création de l’utilisateur.",
      error: error.message,
    });
    console.log("test", error);
  }
};

// Connexion de l'utilisateur
const loginUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    req.session = { userUID: decodedToken.uid }; // Stocker l'UID dans la session

    res.status(200).json({
      message: "Connexion réussie.",
      user,
    });
  } catch (error) {
    res.status(401).json({
      message: "Token invalide ou utilisateur inexistant.",
      error: error.message,
    });
  }
};

// Middleware pour vérifier le token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide.", error: error.message });
  }
};

module.exports = {
  registerAndAddUser,
  loginUser,
  verifyToken,
};
