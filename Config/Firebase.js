const admin = require("firebase-admin");

// Récupérer les variables d'environnement
const serviceAccount = {
  type: "service_account",
  project_id: "betkiff-5148f",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,  // ID de la clé privée
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Clé privée (replacer les \n échappés)
  client_email: "firebase-adminsdk-vq9ev@betkiff-5148f.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,  // ID du client
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,  // URL du certificat
  universe_domain: "googleapis.com",
};

// Initialiser Firebase Admin SDK avec ces informations
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://betkiff-5148f-default-rtdb.europe-west1.firebasedatabase.app",
});

// eslint-disable-next-line no-unused-vars
const auth = admin.auth();

module.exports = admin;
