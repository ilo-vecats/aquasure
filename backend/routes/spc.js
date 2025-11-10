const express = require('express');
const router = express.Router();
const spcController = require('../controllers/spcController');

router.get('/xbar-r-chart', spcController.getXBarRChart);
router.get('/p-chart', spcController.getPChart);
router.get('/c-chart', spcController.getCChart);
router.get('/process-capability', spcController.getProcessCapability);
router.get('/control-charts', spcController.getControlCharts);

module.exports = router;

