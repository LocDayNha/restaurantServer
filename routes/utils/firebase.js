const admin = require('firebase-admin');
const serviceAccount = require('./phoenix-restaurant-401d8-firebase-adminsdk-xbs05-ecbe24d7ab.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'phoenix-restaurant-401d8.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };