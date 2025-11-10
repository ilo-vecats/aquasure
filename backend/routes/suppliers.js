const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.get('/', supplierController.getSuppliers);
router.get('/dashboard', supplierController.getSupplierDashboard);

module.exports = router;

