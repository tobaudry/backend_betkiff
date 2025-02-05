const admin = require("firebase-admin");

const db = admin.database();


const sendNotification = async (userIds, title, body) => {
    try {
      // Récupérer les tokens FCM des utilisateurs
      const tokens = [];
      for (const userId of userIds) {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists && userDoc.data().fcmToken) {
          tokens.push(userDoc.data().fcmToken);
        }
      }
  
      if (tokens.length === 0) {
        console.log("No tokens found for users.");
        return;
      }
  
      const message = {
        notification: { title, body },
        tokens
      };
  
      const response = await admin.messaging().sendMulticast(message);
      console.log("Notifications sent:", response);
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

module.exports = {
    sendNotification
};
