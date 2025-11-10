const Supplier = require('../models/Supplier');

// Get all suppliers (basic list)
exports.getSuppliers = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ 'evaluation.overallRating': -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supplier dashboard summary (TQM Unit 1: Customer-Supplier partnership)
exports.getSupplierDashboard = async (_req, res) => {
  try {
    const suppliers = await Supplier.find();

    if (!suppliers.length) {
      return res.json({
        totalSuppliers: 0,
        statusBreakdown: [],
        averageRatings: {
          overall: 0,
          quality: 0,
          delivery: 0,
          service: 0,
          price: 0
        },
        topSuppliers: [],
        certificationCoverage: {
          iso9001: 0,
          iso14001: 0,
          other: 0
        }
      });
    }

    const totalSuppliers = suppliers.length;

    // Status breakdown
    const statusMap = suppliers.reduce((acc, supplier) => {
      const status = supplier.evaluation?.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalSuppliers) * 100)
    }));

    const ratingAccumulator = suppliers.reduce(
      (acc, supplier) => {
        const criteria = supplier.evaluation?.evaluationCriteria || {};
        acc.overall += supplier.evaluation?.overallRating || 0;
        acc.quality += criteria.quality || 0;
        acc.delivery += criteria.delivery || 0;
        acc.service += criteria.service || 0;
        acc.price += criteria.price || 0;
        return acc;
      },
      { overall: 0, quality: 0, delivery: 0, service: 0, price: 0 }
    );

    const averageRatings = {
      overall: +(ratingAccumulator.overall / totalSuppliers).toFixed(2),
      quality: +(ratingAccumulator.quality / totalSuppliers).toFixed(2),
      delivery: +(ratingAccumulator.delivery / totalSuppliers).toFixed(2),
      service: +(ratingAccumulator.service / totalSuppliers).toFixed(2),
      price: +(ratingAccumulator.price / totalSuppliers).toFixed(2)
    };

    const topSuppliers = suppliers
      .filter(supplier => supplier.evaluation?.overallRating)
      .sort((a, b) => (b.evaluation.overallRating || 0) - (a.evaluation.overallRating || 0))
      .slice(0, 5)
      .map(supplier => ({
        id: supplier._id,
        name: supplier.name,
        type: supplier.type,
        status: supplier.evaluation?.status,
        overallRating: supplier.evaluation?.overallRating || 0,
        lastEvaluationDate: supplier.evaluation?.lastEvaluationDate
      }));

    const certificationCoverage = suppliers.reduce(
      (acc, supplier) => {
        if (supplier.certification?.iso9001) acc.iso9001 += 1;
        if (supplier.certification?.iso14001) acc.iso14001 += 1;
        if (supplier.certification?.other?.length) acc.other += supplier.certification.other.length;
        return acc;
      },
      { iso9001: 0, iso14001: 0, other: 0 }
    );

    res.json({
      totalSuppliers,
      statusBreakdown,
      averageRatings,
      topSuppliers,
      certificationCoverage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

