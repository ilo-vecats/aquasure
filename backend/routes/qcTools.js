const express = require('express');
const router = express.Router();
const qcToolsController = require('../controllers/qcToolsController');

router.get('/pareto', qcToolsController.getParetoChart);
router.get('/histogram', qcToolsController.getHistogram);
router.get('/scatter', qcToolsController.getScatterDiagram);
router.get('/checksheet', qcToolsController.getCheckSheet);
router.get('/process-flow', qcToolsController.getProcessFlow);
router.get('/fishbone', qcToolsController.getFishbone);
router.get('/cause-effect', qcToolsController.getFishbone); // Alias
router.post('/fishbone', qcToolsController.createFishbone);
router.post('/seed/noncompliant', qcToolsController.seedNonCompliantSamples);

module.exports = router;

