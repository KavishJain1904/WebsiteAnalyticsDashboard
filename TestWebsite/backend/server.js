// Add this to your server.js (you already have most of this)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const contentRoutes = require('./routes/content'); // Make sure this exists

const app = express();

// CORS setup
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', contentRoutes); // This should load your content routes

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Content routes loaded - you can now edit website content!');
});