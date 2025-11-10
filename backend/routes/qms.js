const express = require('express');
const router = express.Router();
const qmsController = require('../controllers/qmsController');

// Audits
router.post('/audits', qmsController.createAudit);
router.get('/audits', qmsController.getAudits);
router.get('/audits/:id', qmsController.getAudits);
router.put('/audits/:id', qmsController.updateAudit);

// CAPA
router.post('/capas', qmsController.createCAPA);
router.get('/capas', qmsController.getCAPAs);
router.put('/capas/:id', qmsController.updateCAPA);

// Suppliers
router.post('/suppliers', qmsController.createSupplier);
router.get('/suppliers', qmsController.getSuppliers);
router.put('/suppliers/:id', qmsController.updateSupplier);

// Non-Conformances
router.get('/non-conformances', qmsController.getNonConformances);

module.exports = router;

