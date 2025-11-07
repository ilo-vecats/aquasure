const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');

// Sample routes
router.post('/', sampleController.createSample);
router.get('/', sampleController.getSamples);
router.get('/stats', sampleController.getStatistics);
router.get('/:id', sampleController.getSampleById);
router.put('/:id', sampleController.updateSample);
router.patch('/:id/verify', sampleController.verifySample);
router.post('/:id/corrective-actions', sampleController.addCorrectiveAction);
router.delete('/:id', sampleController.deleteSample);

module.exports = router;

