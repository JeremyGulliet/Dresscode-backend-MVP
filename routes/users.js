var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/bodyCheck')
const bcrypt = require('bcrypt');
const uid2 = require('uid2');



/* Route POST pour le SignUp */
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Verifier si l'utilisateur est déjà enregistré
  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        avatar: '',
        articles: [],
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Utilisateur déjà dans la base de donnée
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

/* Route SignIn */
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, username: data.username });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

//Route PUT pour mettre à jour les données de l'utilisateur 
router.put('/:token/:articleID', (req, res) => {
  const { token, articleID } = req.params;

  User.findOne({ token: token })
    .then(user => {
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }

      user.articles.push(articleID); // Ajoute l'ID de l'article à la liste des articles de l'utilisateur
      return user.save(); // Sauvegarde les modifications de l'utilisateur dans la base de données
    })
    .then(updatedUser => {
      res.json(updatedUser); // Renvoie l'utilisateur mis à jour en réponse
    })
    .catch(error => {
      res.status(500).json({ result: false, error: 'Internal server error' });
    });
});






module.exports = router;
