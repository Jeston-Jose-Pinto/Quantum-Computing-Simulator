const mongoose = require('mongoose');

const GateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    // enum: ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'CZ', 'SWAP', 'RX', 'RY', 'RZ']
  },
  qubit: {
    type: Number,
    required: true,
    min: 0
  },
  control: {
    type: Number,
    default: null
  },
  column: {
    type: Number,
    required: true,
    min: 0
  },
  parameters: {
    angle: Number, // For rotation gates like RX, RY, RZ
    phase: Number
  }
});

const CircuitSchema = new mongoose.Schema({
  userId:{
    type:String,
    required:true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  qubits: {
    type: Number,
    required: true,
    min: 1,
    max: 10 // Reasonable limit for simulation
  },
  gates: [GateSchema],
  depth: {
    type: Number,
    default: 0
  },
  entangled: {
    type: Boolean,
    default: false
  },
  code: {
    qasm: String,
    qiskit: String,
    cirq: String,
    qsharp: String,
    quil: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CircuitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
CircuitSchema.index({ createdAt: -1 });
CircuitSchema.index({ title: 'text' });

module.exports = mongoose.model('Circuit', CircuitSchema);