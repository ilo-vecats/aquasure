const Audit = require('../models/Audit');
const CAPA = require('../models/CAPA');
const Supplier = require('../models/Supplier');
const Sample = require('../models/Sample');

// Audit Management
exports.createAudit = async (req, res) => {
  try {
    const audit = new Audit(req.body);
    await audit.save();
    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAudits = async (req, res) => {
  try {
    const { type, status, standard } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (standard) filter.standard = standard;
    
    const audits = await Audit.find(filter)
      .populate('auditor auditTeam')
      .sort({ scheduledDate: -1 });
    res.json(audits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAudit = async (req, res) => {
  try {
    const audit = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CAPA Management
exports.createCAPA = async (req, res) => {
  try {
    const capa = new CAPA(req.body);
    await capa.save();
    res.status(201).json(capa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCAPAs = async (req, res) => {
  try {
    const { type, status, priority, source } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    
    const capas = await CAPA.find(filter)
      .populate('actionPlan.responsible rootCause.identifiedCauses')
      .sort({ createdAt: -1 });
    res.json(capas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCAPA = async (req, res) => {
  try {
    const capa = await CAPA.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!capa) {
      return res.status(404).json({ error: 'CAPA not found' });
    }
    res.json(capa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supplier Management
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter['evaluation.status'] = status;
    
    const suppliers = await Supplier.find(filter).sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Non-Conformance Report
exports.getNonConformances = async (req, res) => {
  try {
    const { severity, location, startDate, endDate } = req.query;
    
    const filter = {
      $or: [
        { 'compliance.isCompliant': false },
        { status: 'Unsafe' },
        { 'compliance.deviationSeverity': { $ne: 'none' } }
      ]
    };
    
    if (location) filter.location = location;
    if (severity) filter['compliance.deviationSeverity'] = severity;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const nonConformances = await Sample.find(filter)
      .sort({ timestamp: -1 })
      .limit(1000);
    
    res.json({
      total: nonConformances.length,
      bySeverity: {
        critical: nonConformances.filter(nc => nc.compliance.deviationSeverity === 'critical').length,
        major: nonConformances.filter(nc => nc.compliance.deviationSeverity === 'major').length,
        minor: nonConformances.filter(nc => nc.compliance.deviationSeverity === 'minor').length
      },
      samples: nonConformances
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

