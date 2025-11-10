const express = require('express');
const router = express.Router();
const improvementController = require('../controllers/improvementController');

// PDCA Projects
router.post('/pdca', improvementController.createPDCAProject);
router.get('/pdca', improvementController.getPDCAProjects);
router.get('/pdca/:id', improvementController.getPDCAProjects);
router.put('/pdca/:id', improvementController.updatePDCAProject);

// DMAIC Projects
router.post('/dmaic', improvementController.createDMAICProject);
router.get('/dmaic', improvementController.getDMAICProjects);
router.get('/dmaic/:id', improvementController.getDMAICProjects);
router.put('/dmaic/:id', improvementController.updateDMAICProject);

module.exports = router;

