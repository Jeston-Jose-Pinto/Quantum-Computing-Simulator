const express = require('express');
const router = express.Router();
const Circuit = require('../models/circuit');

// GET /api/circuits - Get all circuits (with pagination)
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const circuits = await Circuit.find({userId: req.params.userId}) // Fixed: was req.params.id
      .select('title qubits gates.length depth entangled createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Circuit.countDocuments({userId: req.params.userId});

    res.json({
      circuits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch circuits', error: error.message });
  }
});

// GET /api/circuits/:id - Get specific circuit
router.get('/:id', async (req, res) => {
  try {
    const circuit = await Circuit.findById(req.params.id);
    
    if (!circuit) {
      return res.status(404).json({ message: 'Circuit not found' });
    }

    res.json(circuit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch circuit', error: error.message });
  }
});

// POST /api/circuits - Save new circuit
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      qubits,
      gates,
      depth,
      entangled,
      code
    } = req.body;

    // Validation
    if (!title || !qubits || !Array.isArray(gates)) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, qubits, and gates array' 
      });
    }

    if (qubits < 1 || qubits > 10) {
      return res.status(400).json({ 
        message: 'Number of qubits must be between 1 and 10' 
      });
    }

    const circuit = new Circuit({
      userId,
      title,
      qubits,
      gates,
      depth: depth || 0,
      entangled: entangled || false,
      code: code || {}
    });

    const savedCircuit = await circuit.save();
    
    res.status(201).json({
      message: 'Circuit saved successfully',
      circuit: savedCircuit
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ message: 'Failed to save circuit', error: error.message });
  }
});

// PUT /api/circuits/:id - Update existing circuit
router.put('/:id', async (req, res) => {
  try {
    const circuit = await Circuit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!circuit) {
      return res.status(404).json({ message: 'Circuit not found' });
    }

    res.json({
      message: 'Circuit updated successfully',
      circuit
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ message: 'Failed to update circuit', error: error.message });
  }
});

// DELETE /api/circuits/:id - Delete circuit
router.delete('/:id', async (req, res) => {
  try {
    const circuit = await Circuit.findByIdAndDelete(req.params.id);

    if (!circuit) {
      return res.status(404).json({ message: 'Circuit not found' });
    }

    res.json({ message: 'Circuit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete circuit', error: error.message });
  }
});

// // GET /api/circuits/search/:query - Search circuits by title
// router.get('/search/:query', async (req, res) => {
//   try {
//     const { query } = req.params;
//     const circuits = await Circuit.find({
//       $text: { $search: query }
//     })
//     .select('title qubits gates.length depth entangled createdAt updatedAt')
//     .sort({ score: { $meta: 'textScore' } })
//     .limit(10);

//     res.json({ circuits });
//   } catch (error) {
//     res.status(500).json({ message: 'Search failed', error: error.message });
//   }
// });

module.exports = router;