// routes/messages.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user_id) {
    req.flash('error', 'Login first');
    return res.redirect('/login');
  }
  next();
}

// Show user list
router.get('/chat', requireLogin, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.session.user_id } });
  res.render('chat', { users });
});

// Show messages with a specific user
// Show messages with a specific user
router.get('/chat/:id', requireLogin, async (req, res) => {
  const currentUser = req.session.user_id;
  const chatWith = req.params.id;

  // Prevent chatting with self
  if (currentUser === chatWith) {
    req.flash('error', 'You cannot chat with yourself!');
    return res.redirect('/messages/chat');
  }

  const messages = await Message.find({
    $or: [
      { sender: currentUser, receiver: chatWith },
      { sender: chatWith, receiver: currentUser }
    ]
  }).populate('sender receiver');

  const chatUser = await User.findById(chatWith);
  const currentUserDoc = await User.findById(currentUser);
  res.render('chatWindow', { messages, chatUser, currentUser: currentUserDoc });
});

// Handle message send
router.post('/chat/:id', requireLogin, async (req, res) => {
  const newMsg = new Message({
    sender: req.session.user_id,
    receiver: req.params.id,
    content: req.body.content
  });
  await newMsg.save();
  res.redirect(`/messages/chat/${req.params.id}`);
});

module.exports = router;
