  const admin = require("firebase-admin");

  var ServiceAccount = require("../entrenamiento-de-ligas-firebase-adminsdk-gx04e-c5bf1867b6.json");

  admin.initializeApp({
      credential: admin.credential.cert(ServiceAccount),
      databaseURL: "https://entrenamiento-de-ligas.firebaseio.com"
  });

  const db = admin.firestore();

  module.exports = db;