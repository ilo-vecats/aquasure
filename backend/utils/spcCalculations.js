// Statistical Process Control Calculations
class SPCCalculator {
  // Calculate mean (average)
  static calculateMean(data) {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  // Calculate standard deviation
  static calculateStdDev(data, mean = null) {
    if (!data || data.length === 0) return 0;
    if (data.length === 1) return 0;
    if (!mean) mean = this.calculateMean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    return Math.sqrt(variance);
  }

  // Calculate range
  static calculateRange(data) {
    if (!data || data.length === 0) return 0;
    return Math.max(...data) - Math.min(...data);
  }

  // X-bar Chart (for subgroup averages)
  static calculateXBarChart(subgroups) {
    if (!subgroups || subgroups.length === 0) return null;
    
    const averages = subgroups.map(group => this.calculateMean(group));
    const ranges = subgroups.map(group => this.calculateRange(group));
    
    const xBarBar = this.calculateMean(averages); // Grand average
    const rBar = this.calculateMean(ranges); // Average range
    
    const n = subgroups[0]?.length || 5; // Subgroup size
    const A2 = this.getA2Constant(n);
    
    return {
      centerLine: xBarBar,
      ucl: xBarBar + (A2 * rBar),
      lcl: Math.max(0, xBarBar - (A2 * rBar)),
      data: averages,
      xBarBar,
      rBar
    };
  }

  // R Chart (for subgroup ranges)
  static calculateRChart(subgroups) {
    if (!subgroups || subgroups.length === 0) return null;
    
    const ranges = subgroups.map(group => this.calculateRange(group));
    const rBar = this.calculateMean(ranges);
    
    const n = subgroups[0]?.length || 5;
    const D3 = this.getD3Constant(n);
    const D4 = this.getD4Constant(n);
    
    return {
      centerLine: rBar,
      ucl: D4 * rBar,
      lcl: D3 * rBar,
      data: ranges
    };
  }

  // p-Chart (for fraction defective)
  static calculatePChart(data) {
    // data = [{inspected: 100, defective: 5}, ...]
    if (!data || data.length === 0) return null;
    
    const totalInspected = data.reduce((sum, item) => sum + (item.inspected || 0), 0);
    const totalDefective = data.reduce((sum, item) => sum + (item.defective || 0), 0);
    
    if (totalInspected === 0) return null;
    
    const pBar = totalDefective / totalInspected;
    const proportions = data.map(item => {
      const inspected = item.inspected || 1;
      return (item.defective || 0) / inspected;
    });
    
    return proportions.map((p, idx) => {
      const n = data[idx]?.inspected || 100;
      const stdError = Math.sqrt((pBar * (1 - pBar)) / n);
      
      return {
        centerLine: pBar,
        ucl: pBar + (3 * stdError),
        lcl: Math.max(0, pBar - (3 * stdError)),
        value: p,
        index: idx + 1
      };
    });
  }

  // c-Chart (for count of defects)
  static calculateCChart(defectCounts) {
    if (!defectCounts || defectCounts.length === 0) return null;
    
    const cBar = this.calculateMean(defectCounts);
    const stdDev = Math.sqrt(cBar);
    
    return {
      centerLine: cBar,
      ucl: cBar + (3 * stdDev),
      lcl: Math.max(0, cBar - (3 * stdDev)),
      data: defectCounts
    };
  }

  // Process Capability Indices
  static calculateProcessCapability(data, usl, lsl) {
    if (!data || data.length === 0) return null;
    if (!usl && !lsl) return null;
    
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStdDev(data, mean);
    
    if (stdDev === 0) return null;
    
    // Cp - Process Capability
    const cp = usl && lsl ? (usl - lsl) / (6 * stdDev) : null;
    
    // Cpk - Process Capability Index
    let cpk = null;
    if (usl && lsl) {
      const cpkUpper = usl ? (usl - mean) / (3 * stdDev) : null;
      const cpkLower = lsl ? (mean - lsl) / (3 * stdDev) : null;
      if (cpkUpper !== null && cpkLower !== null) {
        cpk = Math.min(cpkUpper, cpkLower);
      } else if (cpkUpper !== null) {
        cpk = cpkUpper;
      } else if (cpkLower !== null) {
        cpk = cpkLower;
      }
    }
    
    // Pp - Process Performance
    const pp = usl && lsl ? (usl - lsl) / (6 * stdDev) : null;
    
    // Ppk - Process Performance Index
    let ppk = null;
    if (usl || lsl) {
      const ppkUpper = usl ? (usl - mean) / (3 * stdDev) : null;
      const ppkLower = lsl ? (mean - lsl) / (3 * stdDev) : null;
      if (ppkUpper !== null && ppkLower !== null) {
        ppk = Math.min(ppkUpper, ppkLower);
      } else if (ppkUpper !== null) {
        ppk = ppkUpper;
      } else if (ppkLower !== null) {
        ppk = ppkLower;
      }
    }
    
    return { cp, cpk, pp, ppk, mean, stdDev };
  }

  // Out-of-Control Detection (Western Electric Rules)
  static detectOutOfControl(data, ucl, lcl, centerLine) {
    if (!data || data.length === 0) return [];
    
    const violations = [];
    
    // Rule 1: One point beyond control limits
    data.forEach((point, i) => {
      if (point > ucl || point < lcl) {
        violations.push({
          index: i,
          rule: 'Rule 1: Point beyond control limits',
          severity: 'critical',
          value: point
        });
      }
    });
    
    // Rule 2: 9 points in a row on same side of center line
    for (let i = 8; i < data.length; i++) {
      const subset = data.slice(i - 8, i + 1);
      if (subset.every(p => p > centerLine) || subset.every(p => p < centerLine)) {
        violations.push({
          index: i,
          rule: 'Rule 2: 9 consecutive points on one side',
          severity: 'major',
          value: data[i]
        });
      }
    }
    
    // Rule 3: 6 points in a row steadily increasing or decreasing
    for (let i = 5; i < data.length; i++) {
      const subset = data.slice(i - 5, i + 1);
      const increasing = subset.every((val, j) => j === 0 || val > subset[j - 1]);
      const decreasing = subset.every((val, j) => j === 0 || val < subset[j - 1]);
      
      if (increasing || decreasing) {
        violations.push({
          index: i,
          rule: 'Rule 3: 6 points in a row trending',
          severity: 'major',
          value: data[i],
          trend: increasing ? 'increasing' : 'decreasing'
        });
      }
    }
    
    // Rule 4: 14 points alternating up and down
    for (let i = 13; i < data.length; i++) {
      const subset = data.slice(i - 13, i + 1);
      let alternating = true;
      for (let j = 1; j < subset.length; j++) {
        const expectedDirection = j % 2 === 0 ? 'up' : 'down';
        const actualDirection = subset[j] > subset[j - 1] ? 'up' : 'down';
        if (actualDirection === expectedDirection) {
          alternating = false;
          break;
        }
      }
      if (alternating) {
        violations.push({
          index: i,
          rule: 'Rule 4: 14 points alternating',
          severity: 'minor',
          value: data[i]
        });
      }
    }
    
    return violations;
  }

  // Control Chart Constants
  static getA2Constant(n) {
    const constants = {
      2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 
      6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308
    };
    return constants[n] || 0.308;
  }

  static getD3Constant(n) {
    const constants = {
      2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 
      7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223
    };
    return constants[n] || 0;
  }

  static getD4Constant(n) {
    const constants = {
      2: 3.267, 3: 2.575, 4: 2.282, 5: 2.115, 
      6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777
    };
    return constants[n] || 1.777;
  }

  // Create subgroups from time series data
  static createSubgroups(data, subgroupSize = 5) {
    if (!data || data.length === 0) return [];
    
    const subgroups = [];
    for (let i = 0; i < data.length; i += subgroupSize) {
      subgroups.push(data.slice(i, i + subgroupSize));
    }
    return subgroups;
  }
}

module.exports = SPCCalculator;
