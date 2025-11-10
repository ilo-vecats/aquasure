const Sample = require('../models/Sample');
const QCTools = require('../utils/qcTools');

// Pareto Chart - Analyze non-compliance causes
exports.getParetoChart = async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter);
    
    // Count non-compliant parameters
    const paramCounts = {};
    samples.forEach(sample => {
      if (sample.compliance && sample.compliance.nonCompliantParams && sample.compliance.nonCompliantParams.length > 0) {
        sample.compliance.nonCompliantParams.forEach(param => {
          paramCounts[param] = (paramCounts[param] || 0) + 1;
        });
      }
    });
    
    // If no non-compliances, return empty with message
    if (Object.keys(paramCounts).length === 0) {
      return res.json({
        pareto: [],
        summary: {
          totalNonCompliances: 0,
          totalSamples: samples.length,
          message: 'No non-compliant parameters found. All samples are compliant!'
        }
      });
    }
    
    const paretoData = Object.keys(paramCounts).map(category => ({
      category,
      count: paramCounts[category]
    }));
    
    const pareto = QCTools.calculatePareto(paretoData);
    
    res.json({
      pareto: pareto || [],
      summary: {
        totalNonCompliances: Object.values(paramCounts).reduce((sum, val) => sum + val, 0),
        totalSamples: samples.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Histogram - Distribution of parameter values
exports.getHistogram = async (req, res) => {
  try {
    const { parameter, location, bins = 10, startDate, endDate } = req.query;
    
    if (!parameter) {
      return res.status(400).json({ error: 'Parameter is required' });
    }
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter);
    
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
    
    const histogram = QCTools.calculateHistogram(data, parseInt(bins));
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    res.json({
      histogram,
      parameter,
      sampleCount: samples.length,
      statistics: {
        mean,
        min: Math.min(...data),
        max: Math.max(...data),
        stdDev
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Scatter Diagram - Correlation between two parameters
exports.getScatterDiagram = async (req, res) => {
  try {
    let { paramX, paramY, location, startDate, endDate } = req.query;
    
    // Default parameters if not provided
    if (!paramX) paramX = 'ph';
    if (!paramY) paramY = 'tds';
    
    const filter = {};
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const samples = await Sample.find(filter);
    
    const getValue = (sample, param) => {
      switch (param) {
        case 'ph': return sample.ph;
        case 'tds': return sample.tds;
        case 'turbidity': return sample.turbidity;
        case 'chlorine': return sample.chlorine;
        case 'qualityIndex': return sample.qualityIndex;
        default: return null;
      }
    };
    
    const xData = samples.map(s => getValue(s, paramX)).filter(v => v !== null);
    const yData = samples.map(s => getValue(s, paramY)).filter(v => v !== null);
    
    if (xData.length !== yData.length || xData.length === 0) {
      return res.status(400).json({ error: 'Insufficient data for correlation' });
    }
    
    const correlation = QCTools.calculateCorrelation(xData, yData);
    
    if (!correlation || !correlation.dataPoints || correlation.dataPoints.length === 0) {
      return res.status(400).json({ error: 'Insufficient data for correlation analysis' });
    }
    
    res.json({
      correlation: correlation.correlation,
      strength: correlation.strength,
      direction: correlation.direction,
      dataPoints: correlation.dataPoints,
      paramX,
      paramY,
      sampleCount: xData.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check Sheet - Daily defect tracking
exports.getCheckSheet = async (req, res) => {
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
    
    // Get all unique non-compliant parameters
    const categories = new Set();
    samples.forEach(sample => {
      if (sample.compliance.nonCompliantParams) {
        sample.compliance.nonCompliantParams.forEach(param => categories.add(param));
      }
    });
    
    // Group by date
    const dailyData = {};
    samples.forEach(sample => {
      const date = sample.timestamp.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, defects: {} };
        Array.from(categories).forEach(cat => {
          dailyData[date].defects[cat] = 0;
        });
      }
      
      if (sample.compliance.nonCompliantParams) {
        sample.compliance.nonCompliantParams.forEach(param => {
          dailyData[date].defects[param] = (dailyData[date].defects[param] || 0) + 1;
        });
      }
    });
    
    const checkSheet = QCTools.createCheckSheet(
      Array.from(categories),
      Object.values(dailyData)
    );
    
    res.json(checkSheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Process Flow Analysis
exports.getProcessFlow = async (req, res) => {
  try {
    // Analyze the water quality process flow
    const samples = await Sample.find().sort({ timestamp: 1 });
    
    // Group by location type (if available) or location
    const locationGroups = {};
    samples.forEach(sample => {
      const loc = sample.locationDetails?.type || sample.location || 'Unknown';
      if (!locationGroups[loc]) {
        locationGroups[loc] = {
          location: loc,
          count: 0,
          totalDefects: 0,
          avgQualityIndex: 0,
          samples: []
        };
      }
      locationGroups[loc].count++;
      locationGroups[loc].totalDefects += sample.compliance.nonCompliantParams?.length || 0;
      locationGroups[loc].samples.push(sample.qualityIndex);
    });
    
    // Calculate averages
    Object.keys(locationGroups).forEach(loc => {
      const group = locationGroups[loc];
      group.avgQualityIndex = group.samples.reduce((sum, val) => sum + val, 0) / group.samples.length;
      group.defectRate = group.totalDefects / group.count;
      group.duration = group.count; // Simplified - could use actual time differences
    });
    
    const steps = Object.values(locationGroups).map((group, idx) => ({
      id: idx + 1,
      name: group.location,
      duration: group.duration,
      defects: group.totalDefects,
      qualityIndex: group.avgQualityIndex
    }));
    
    const processFlow = QCTools.analyzeProcessFlow(steps);
    
    res.json(processFlow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Fishbone structure (GET endpoint)
exports.getFishbone = async (req, res) => {
  try {
    const { problem } = req.query;
    
    // Get samples to analyze common issues
    const samples = await Sample.find().limit(100);
    
    // Analyze common non-compliance causes
    const causeCategories = {
      'Man (People)': [
        'Insufficient training on sampling procedures',
        'Human error in data entry',
        'Improper sample collection technique'
      ],
      'Machine (Equipment)': [
        'Calibration issues with pH meter',
        'TDS meter malfunction',
        'Turbidity meter not calibrated',
        'Chlorine testing equipment outdated'
      ],
      'Material': [
        'Source water contamination',
        'Treatment chemicals expired',
        'Poor quality source water',
        'Insufficient treatment chemicals'
      ],
      'Method (Process)': [
        'Inadequate chlorination process',
        'Filtration system not working properly',
        'pH adjustment process failure',
        'Insufficient treatment time'
      ],
      'Measurement': [
        'Incorrect measurement techniques',
        'Measurement timing issues',
        'Equipment calibration errors',
        'Sample contamination during testing'
      ],
      'Environment': [
        'High temperature affecting water quality',
        'Seasonal variations',
        'Industrial pollution in source',
        'Heavy rainfall affecting source water'
      ]
    };
    
    // Populate causes based on actual data
    const nonCompliantParams = new Set();
    samples.forEach(sample => {
      if (sample.compliance && sample.compliance.nonCompliantParams) {
        sample.compliance.nonCompliantParams.forEach(param => nonCompliantParams.add(param));
      }
    });
    
    // Add specific causes based on non-compliant parameters
    if (nonCompliantParams.has('pH')) {
      causeCategories['Machine (Equipment)'].push('pH meter calibration drift');
      causeCategories['Method (Process)'].push('pH adjustment process not effective');
    }
    if (nonCompliantParams.has('TDS')) {
      causeCategories['Material'].push('High TDS in source water');
      causeCategories['Method (Process)'].push('Filtration system insufficient');
    }
    if (nonCompliantParams.has('Turbidity')) {
      causeCategories['Method (Process)'].push('Coagulation process not working');
      causeCategories['Material'].push('High turbidity in source water');
    }
    if (nonCompliantParams.has('Chlorine')) {
      causeCategories['Method (Process)'].push('Chlorination dosage incorrect');
      causeCategories['Machine (Equipment)'].push('Chlorine dosing pump malfunction');
    }
    
    const fishbone = {
      effect: problem || 'Water Quality Non-Compliance',
      categories: Object.keys(causeCategories).map(name => ({
        name,
        causes: causeCategories[name]
      }))
    };
    
    res.json(fishbone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Fishbone structure (POST endpoint)
exports.createFishbone = async (req, res) => {
  try {
    const { problem } = req.body;
    
    const fishbone = QCTools.createFishboneStructure();
    if (problem) fishbone.problem = problem;
    
    res.json(fishbone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Seed a few non-compliant samples to demo Pareto/other tools
exports.seedNonCompliantSamples = async (req, res) => {
  try {
    const { count = 8, location = 'Jaipur' } = req.body || {};
    const now = new Date();
    const created = [];

    // Prepare varied non-compliance across parameters
    const templates = [
      { ph: 9.2, tds: 650, turbidity: 0.8, chlorine: 0.15 },  // pH high, TDS high, chlorine low
      { ph: 6.2, tds: 300, turbidity: 6.5, chlorine: 0.3 },   // pH low, Turbidity high
      { ph: 7.1, tds: 1200, turbidity: 0.7, chlorine: 0.4 },  // TDS very high
      { ph: 8.7, tds: 520, turbidity: 5.8, chlorine: 1.2 },   // pH high, TDS high, Turbidity high, Chlorine high
      { ph: 7.0, tds: 700, turbidity: 2.0, chlorine: 0.1 },   // TDS high, chlorine low
      { ph: 6.4, tds: 450, turbidity: 1.5, chlorine: 0.18 },  // pH low, chlorine low
      { ph: 8.6, tds: 480, turbidity: 0.5, chlorine: 0.25 },  // pH slightly high
      { ph: 7.3, tds: 800, turbidity: 5.5, chlorine: 0.35 }   // TDS high, turbidity high
    ];

    for (let i = 0; i < Number(count); i++) {
      const t = templates[i % templates.length];
      const timestamp = new Date(now.getTime() - i * 3600 * 1000); // spread by hours

      // Derive qualityIndex and status similar to createSample logic
      let score = 100;
      // pH penalty
      if (t.ph < 6.5 || t.ph > 8.5) {
        score -= Math.abs(t.ph - 7) * 8;
      } else {
        score -= Math.abs(t.ph - 7) * 3;
      }
      // TDS penalty
      if (t.tds > 500) {
        score -= (t.tds - 500) / 10;
      }
      if (t.tds > 1000) {
        score -= 20;
      }
      // Turbidity penalty
      if (t.turbidity > 1) {
        score -= (t.turbidity - 1) * 5;
      }
      if (t.turbidity > 5) {
        score -= 15;
      }
      // Chlorine penalty
      if (t.chlorine < 0.2) {
        score -= (0.2 - t.chlorine) * 50;
      } else if (t.chlorine > 1.0) {
        score -= (t.chlorine - 1.0) * 30;
      } else if (t.chlorine > 0.5) {
        score -= (t.chlorine - 0.5) * 10;
      }
      score = Math.max(0, Math.min(100, Math.round(score)));

      let status = 'Borderline';
      if (score >= 80) status = 'Safe';
      else if (score < 50) status = 'Unsafe';

      // Build nonCompliantParams consistent with standards
      const nonCompliantParams = [];
      if (t.ph < 6.5 || t.ph > 8.5) nonCompliantParams.push('pH');
      if (t.tds > 500) nonCompliantParams.push('TDS');
      if (t.turbidity > 5) nonCompliantParams.push('Turbidity');
      if (t.chlorine < 0.2 || t.chlorine > 1.0) nonCompliantParams.push('Chlorine');

      const sample = await Sample.create({
        location,
        timestamp,
        ph: t.ph,
        tds: t.tds,
        turbidity: t.turbidity,
        chlorine: t.chlorine,
        qualityIndex: score,
        status,
        compliance: {
          isCompliant: nonCompliantParams.length === 0,
          nonCompliantParams,
          deviationSeverity: nonCompliantParams.length === 0 ? 'none' : (nonCompliantParams.length > 2 ? 'major' : 'minor')
        },
        notes: 'Seeded non-compliance sample for QC Tools demo'
      });
      created.push(sample);
    }

    res.status(201).json({
      message: `Seeded ${created.length} non-compliant samples at ${location}`,
      createdCount: created.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
