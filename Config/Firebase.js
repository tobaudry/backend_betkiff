const admin = require("firebase-admin");

// Vérifier si l'app Firebase a déjà été initialisée
if (admin.apps.length === 0) {
  const serviceAccount = {
    type: "service_account",
    project_id: "enfc-pari",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,  // ID de la clé privée
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Clé privée (replacer les \n échappés)
    client_email: "firebase-adminsdk-td7zl@enfc-pari.iam.gserviceaccount.com",
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
    databaseURL: "https://enfc-pari-default-rtdb.firebaseio.com",
  });
} else {
  console.log("Firebase app already initialized.");
}

// eslint-disable-next-line no-unused-vars
const auth = admin.auth();

const messaging = admin.messaging();

module.exports = {admin, messaging};
