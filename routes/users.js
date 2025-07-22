// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Show register form
router.get('/register', (req, res) => {
  res.render('register', { error: req.flash('error') });
});

// Handle register logic
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    req.session.user_id = newUser._id;
    req.flash('success', 'Registered successfully!');
    res.redirect('/chat');
  } catch (e) {
    req.flash('error', 'Username already taken!');
    res.redirect('/register');
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

// Handle login logic
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    req.flash('success', 'Welcome back!');
    res.redirect('/chat');
  } else {
    req.flash('error', 'Invalid credentials');
    res.redirect('/login');
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
