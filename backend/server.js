const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// require('dotenv').config();

const connectDB = require("./config/database")
const circuitRoutes = require('./routes/circuit');
const { errorHandler } = require('./middlewear/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:5500',"http://127.0.0.1:5500/Quantum-Computing-Simulator"], // Add your frontend URLs
//   credentials: true
// }));

app.use(cors({
  origin: true, // This allows all origins during development
  credentials: true
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/circuits', circuitRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Quantum Circuit Server running on port ${PORT}`);
});