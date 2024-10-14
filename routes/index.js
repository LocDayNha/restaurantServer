var express = require('express');
var router = express.Router();

/* Login */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* Register */
router.get('/register', function(req, res, next) {
  res.render('register');
});

/* Home */
router.get('/home', function(req, res, next) {
  res.render('home');
});

/* Data */
router.get('/data', function(req, res, next) {
  res.render('data');
});

module.exports = router;
