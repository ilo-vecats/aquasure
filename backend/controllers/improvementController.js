const PDCAProject = require('../models/PDCAProject');
const DMAICProject = require('../models/DMAICProject');

// PDCA Projects
exports.createPDCAProject = async (req, res) => {
  try {
    const project = new PDCAProject(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPDCAProjects = async (req, res) => {
  try {
    const { status, currentPhase } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (currentPhase) filter.currentPhase = currentPhase;
    
    const projects = await PDCAProject.find(filter)
      .populate('team plan.actionPlan.responsible')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePDCAProject = async (req, res) => {
  try {
    const project = await PDCAProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ error: 'PDCA project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DMAIC Projects
exports.createDMAICProject = async (req, res) => {
  try {
    const project = new DMAICProject(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDMAICProjects = async (req, res) => {
  try {
    const { status, currentPhase } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (currentPhase) filter.currentPhase = currentPhase;
    
    const projects = await DMAICProject.find(filter)
      .populate('team improve.implementationPlan.responsible')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDMAICProject = async (req, res) => {
  try {
    const project = await DMAICProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ error: 'DMAIC project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

