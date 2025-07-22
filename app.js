// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// MongoDB setup as before...
mongoose.connect('mongodb://127.0.0.1:27017/whatsappApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("DB error:", err));

// Session config
const sessionConfig = {
  secret: 'secretCode',
  resave: false,
  saveUninitialized: false
};
app.use(session(sessionConfig));

// Set view engine and middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Make flash messages available
app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = null;

  if (req.session.user_id) {
    const user = await require('./models/user').findById(req.session.user_id);
    res.locals.currentUser = user;
  }

  next();
});

// Routes
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
app.use('/', userRoutes);
app.use('/messages', messageRoutes);

// Optional redirect
app.get('/chat', (req, res) => res.redirect('/messages/chat'));

// SOCKET.IO CODE 👇
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chatMessage', ({ roomId, message }) => {
    io.to(roomId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
