const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// Prediction routes
router.get('/generate', predictionController.generatePrediction);
router.get('/', predictionController.getPredictions);
router.get('/alerts', predictionController.getActiveAlerts);
router.get('/stats', predictionController.getPredictionStats);
router.patch('/:id/outcome', predictionController.updatePredictionOutcome);

module.exports = router;

