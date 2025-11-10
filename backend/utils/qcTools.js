// 7 QC Tools Calculations

class QCTools {
  // 1. Pareto Chart - 80/20 rule analysis
  static calculatePareto(data) {
    // data = [{category: 'A', count: 50}, ...]
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
    if (total === 0) return null;
    
    // Sort by count descending
    const sorted = [...data].sort((a, b) => (b.count || 0) - (a.count || 0));
    
    // Calculate cumulative percentage
    let cumulative = 0;
    const paretoData = sorted.map((item, idx) => {
      cumulative += item.count || 0;
      return {
        category: item.category,
        count: item.count || 0,
        percentage: ((item.count || 0) / total) * 100,
        cumulative: cumulative,
        cumulativePercentage: (cumulative / total) * 100,
        rank: idx + 1
      };
    });
    
    return paretoData;
  }

  // 2. Histogram - Frequency distribution
  static calculateHistogram(data, bins = 10) {
    if (!data || data.length === 0) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const binWidth = range === 0 ? 1 : range / bins;
    
    const histogram = Array(bins).fill(0).map((_, i) => ({
      bin: i,
      start: min + (i * binWidth),
      end: min + ((i + 1) * binWidth),
      count: 0,
      frequency: 0
    }));
    
    data.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        bins - 1
      );
      histogram[binIndex].count++;
    });
    
    const total = data.length;
    histogram.forEach(bin => {
      bin.frequency = (bin.count / total) * 100;
    });
    
    return histogram;
  }

  // 3. Scatter Diagram - Correlation analysis
  static calculateCorrelation(xData, yData) {
    if (!xData || !yData || xData.length !== yData.length) return null;
    if (xData.length === 0) return null;
    
    const n = xData.length;
    const xMean = xData.reduce((sum, val) => sum + val, 0) / n;
    const yMean = yData.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xData[i] - xMean;
      const yDiff = yData[i] - yMean;
      numerator += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(xVariance * yVariance);
    const correlation = denominator !== 0 ? numerator / denominator : 0;
    
    // Determine strength
    let strength = 'none';
    if (Math.abs(correlation) >= 0.9) strength = 'very strong';
    else if (Math.abs(correlation) >= 0.7) strength = 'strong';
    else if (Math.abs(correlation) >= 0.5) strength = 'moderate';
    else if (Math.abs(correlation) >= 0.3) strength = 'weak';
    
    return {
      correlation: correlation,
      strength: strength,
      direction: correlation > 0 ? 'positive' : 'negative',
      dataPoints: xData.map((x, i) => ({ x, y: yData[i] }))
    };
  }

  // 4. Check Sheet - Data collection template
  static createCheckSheet(categories, data) {
    // categories = ['Defect A', 'Defect B', ...]
    // data = [{date: '2024-01-01', defects: {A: 2, B: 5}}, ...]
    
    const checkSheet = {
      categories: categories,
      summary: {},
      dailyData: data.map(entry => {
        const daySummary = {};
        categories.forEach(cat => {
          daySummary[cat] = entry.defects?.[cat] || 0;
        });
        daySummary.total = Object.values(daySummary).reduce((sum, val) => sum + val, 0);
        daySummary.date = entry.date;
        return daySummary;
      })
    };
    
    // Calculate totals
    categories.forEach(cat => {
      checkSheet.summary[cat] = checkSheet.dailyData.reduce(
        (sum, day) => sum + (day[cat] || 0), 0
      );
    });
    checkSheet.summary.total = Object.values(checkSheet.summary).reduce(
      (sum, val) => sum + val, 0
    );
    
    return checkSheet;
  }

  // 5. Cause and Effect (Fishbone) - Structure for root cause analysis
  static createFishboneStructure() {
    return {
      problem: '',
      categories: [
        {
          name: 'Man (People)',
          causes: []
        },
        {
          name: 'Machine (Equipment)',
          causes: []
        },
        {
          name: 'Material',
          causes: []
        },
        {
          name: 'Method (Process)',
          causes: []
        },
        {
          name: 'Measurement',
          causes: []
        },
        {
          name: 'Environment',
          causes: []
        }
      ],
      rootCauses: []
    };
  }

  // 6. Process Flow Diagram - Step analysis
  static analyzeProcessFlow(steps) {
    // steps = [{id: 1, name: 'Step 1', duration: 10, defects: 2}, ...]
    if (!steps || steps.length === 0) return null;
    
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);
    const totalDefects = steps.reduce((sum, step) => sum + (step.defects || 0), 0);
    
    return {
      steps: steps.map((step, idx) => ({
        ...step,
        sequence: idx + 1,
        durationPercentage: totalDuration > 0 ? ((step.duration || 0) / totalDuration) * 100 : 0,
        defectRate: step.defects || 0,
        isBottleneck: (step.duration || 0) > (totalDuration / steps.length) * 1.5
      })),
      totalDuration,
      totalDefects,
      averageDefectRate: totalDefects / steps.length,
      bottlenecks: steps.filter(step => 
        (step.duration || 0) > (totalDuration / steps.length) * 1.5
      )
    };
  }

  // 7. Control Chart (covered in SPC)
  // This is handled by SPCCalculator class
}

module.exports = QCTools;
