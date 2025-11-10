const Sample = require('../models/Sample');
const ControlChart = require('../models/ControlChart');
const SPCCalculator = require('../utils/spcCalculations');

// Get X-bar R Chart data
exports.getXBarRChart = async (req, res) => {
  try {
    const { parameter, location, startDate, endDate, subgroupSize = 5 } = req.query;
    
    // Build filter
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Get samples
    const samples = await Sample.find(filter).sort({ timestamp: 1 });
    if (samples.length === 0) {
      return res.status(404).json({ error: 'No samples found for the specified criteria' });
    }
    
    // Extract parameter values
    let data = [];
    switch (parameter) {
      case 'ph':
        data = samples.map(s => s.ph);
        break;
      case 'tds':
        data = samples.map(s => s.tds);
        break;
      case 'turbidity':
        data = samples.map(s => s.turbidity);
        break;
      case 'chlorine':
        data = samples.map(s => s.chlorine);
        break;
      case 'qualityIndex':
        data = samples.map(s => s.qualityIndex);
        break;
      default:
        return res.status(400).json({ error: 'Invalid parameter' });
    }
    
    // Create subgroups
    const subgroups = SPCCalculator.createSubgroups(data, parseInt(subgroupSize));
    
    // Calculate X-bar and R charts
    const xBarChart = SPCCalculator.calculateXBarChart(subgroups);
    const rChart = SPCCalculator.calculateRChart(subgroups);
    
    // Calculate process capability (using sample limits)
    const usl = req.query.usl ? parseFloat(req.query.usl) : null;
    const lsl = req.query.lsl ? parseFloat(req.query.lsl) : null;
    const processCapability = SPCCalculator.calculateProcessCapability(data, usl, lsl);
    
    // Detect violations
    const violations = SPCCalculator.detectOutOfControl(
      xBarChart.data,
      xBarChart.ucl,
      xBarChart.lcl,
      xBarChart.centerLine
    );
    
    // Determine status
    let status = 'In Control';
    if (violations.some(v => v.severity === 'critical')) {
      status = 'Out of Control';
    } else if (violations.length > 0) {
      status = 'Needs Review';
    }
    
    // Save or update control chart
    const chartData = {
      type: 'X-bar R',
      parameter: parameter,
      location: location || 'All',
      period: {
        startDate: startDate ? new Date(startDate) : samples[0].timestamp,
        endDate: endDate ? new Date(endDate) : samples[samples.length - 1].timestamp
      },
      data: subgroups.map((subgroup, idx) => ({
        subgroup: idx + 1,
        values: subgroup,
        average: SPCCalculator.calculateMean(subgroup),
        range: SPCCalculator.calculateRange(subgroup),
        date: samples[idx * parseInt(subgroupSize)]?.timestamp
      })),
      controlLimits: {
        centerLine: xBarChart.centerLine,
        ucl: xBarChart.ucl,
        lcl: xBarChart.lcl,
        usl: usl,
        lsl: lsl
      },
      processCapability: processCapability,
      violations: violations,
      status: status
    };
    
    // Try to find existing chart or create new
    const existingChart = await ControlChart.findOne({
      type: 'X-bar R',
      parameter: parameter,
      location: location || 'All'
    });
    
    if (existingChart) {
      Object.assign(existingChart, chartData);
      await existingChart.save();
    } else {
      await ControlChart.create(chartData);
    }
    
    res.json({
      xBarChart,
      rChart,
      processCapability,
      violations,
      status,
      parameter,
      sampleCount: samples.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get p-Chart data
exports.getPChart = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Group samples by date
    const samples = await Sample.find(filter).sort({ timestamp: 1 });
    
    // For p-chart, we need inspected vs defective
    // Assuming each sample represents an inspection
    // Defective = samples with status 'Unsafe' or non-compliant
    const dailyData = {};
    
    samples.forEach(sample => {
      const date = sample.timestamp.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { inspected: 0, defective: 0 };
      }
      dailyData[date].inspected++;
      if (sample.status === 'Unsafe' || !sample.compliance.isCompliant) {
        dailyData[date].defective++;
      }
    });
    
    const chartData = Object.keys(dailyData).map(date => ({
      date,
      inspected: dailyData[date].inspected,
      defective: dailyData[date].defective
    }));
    
    const pChart = SPCCalculator.calculatePChart(chartData);
    
    res.json({
      pChart,
      dailyData: chartData,
      summary: {
        totalInspected: chartData.reduce((sum, d) => sum + d.inspected, 0),
        totalDefective: chartData.reduce((sum, d) => sum + d.defective, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get c-Chart data
exports.getCChart = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter).sort({ timestamp: 1 });
    
    // Count defects per sample (non-compliant parameters)
    const defectCounts = samples.map(sample => {
      return sample.compliance.nonCompliantParams?.length || 0;
    });
    
    const cChart = SPCCalculator.calculateCChart(defectCounts);
    
    // Detect violations
    const violations = SPCCalculator.detectOutOfControl(
      defectCounts,
      cChart.ucl,
      cChart.lcl,
      cChart.centerLine
    );
    
    res.json({
      cChart,
      violations,
      defectCounts: defectCounts.map((count, idx) => ({
        sample: idx + 1,
        date: samples[idx].timestamp,
        defects: count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Process Capability
exports.getProcessCapability = async (req, res) => {
  try {
    const { parameter, location, usl, lsl, startDate, endDate } = req.query;
    
    if (!usl && !lsl) {
      return res.status(400).json({ error: 'USL or LSL required' });
    }
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter).sort({ timestamp: 1 });
    
    let data = [];
    switch (parameter) {
      case 'ph':
        data = samples.map(s => s.ph);
        break;
      case 'tds':
        data = samples.map(s => s.tds);
        break;
      case 'turbidity':
        data = samples.map(s => s.turbidity);
        break;
      case 'chlorine':
        data = samples.map(s => s.chlorine);
        break;
      case 'qualityIndex':
        data = samples.map(s => s.qualityIndex);
        break;
      default:
        return res.status(400).json({ error: 'Invalid parameter' });
    }
    
    const capability = SPCCalculator.calculateProcessCapability(
      data,
      usl ? parseFloat(usl) : null,
      lsl ? parseFloat(lsl) : null
    );
    
    // Interpretation
    let interpretation = '';
    if (capability.cpk) {
      if (capability.cpk >= 1.67) interpretation = 'Excellent - Process is highly capable';
      else if (capability.cpk >= 1.33) interpretation = 'Good - Process is capable';
      else if (capability.cpk >= 1.0) interpretation = 'Marginal - Process is barely capable';
      else interpretation = 'Poor - Process is not capable';
    }
    
    res.json({
      ...capability,
      interpretation,
      sampleCount: samples.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all control charts
exports.getControlCharts = async (req, res) => {
  try {
    const { type, parameter, location } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (parameter) filter.parameter = parameter;
    if (location) filter.location = location;
    
    const charts = await ControlChart.find(filter).sort({ createdAt: -1 });
    res.json(charts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

