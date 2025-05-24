// Simple Express server for the iREVA application
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const createMemoryStore = require('memorystore');

const app = express();
const PORT = 3000;
const MemoryStore = createMemoryStore(session);

// Basic user database for testing
const users = [
  { id: 1, username: 'admin', password: 'adminpassword', role: 'admin' },
  { id: 2, username: 'testuser', password: 'password', role: 'investor' }
];

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session
app.use(session({
  secret: 'ireva-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // 24 hours
  }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false 
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return done(null, false, { message: 'Invalid credentials' });
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'server/public')));

// Login page
app.get(['/', '/login', '/auth'], (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/investor/dashboard');
    }
  }
  res.sendFile(path.join(__dirname, 'server/public/direct-login.html'));
});

// Login API
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/investor/dashboard';
      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        redirect: redirectPath
      });
    });
  })(req, res, next);
});

// Logout
app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.status(200).json({ redirect: '/login' });
  });
});

// Get user info
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

// Dashboard routes with authentication
app.get('/admin/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  
  if (req.user.role !== 'admin') {
    return res.redirect('/investor/dashboard');
  }
  
  res.sendFile(path.join(__dirname, 'server/public/admin/dashboard.html'));
});

app.get('/investor/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  
  res.sendFile(path.join(__dirname, 'server/public/investor/dashboard.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});