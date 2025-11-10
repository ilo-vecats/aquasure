import React, { useState, useEffect } from 'react';
import API from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ProcessCapability.css';

export default function ProcessCapability() {
  const [pChartData, setPChartData] = useState(null);
  const [cChartData, setCChartData] = useState(null);
  const [processCapability, setProcessCapability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('p-chart');

  useEffect(() => {
    if (activeTab === 'p-chart') {
      fetchPChart();
    } else if (activeTab === 'c-chart') {
      fetchCChart();
    } else if (activeTab === 'capability') {
      fetchProcessCapability();
    }
  }, [activeTab]);

  const fetchPChart = async () => {
    setLoading(true);
    try {
      const res = await API.get('/spc/p-chart?subgroupSize=10');
      // Attach control lines to each point for charting
      const data = res.data || getSamplePChart();
      const chartWithLimits = (data.chart || []).map(point => ({
        ...point,
        centerLine: data.centerLine,
        ucl: data.ucl,
        lcl: data.lcl
      }));
      setPChartData({ ...data, chart: chartWithLimits });
    } catch (err) {
      console.error('Error fetching p-chart:', err);
      const data = getSamplePChart();
      const chartWithLimits = data.chart.map(point => ({
        ...point,
        centerLine: data.centerLine,
        ucl: data.ucl,
        lcl: data.lcl
      }));
      setPChartData({ ...data, chart: chartWithLimits });
    } finally {
      setLoading(false);
    }
  };

  const fetchCChart = async () => {
    setLoading(true);
    try {
      const res = await API.get('/spc/c-chart');
      const data = res.data || getSampleCChart();
      const chartWithLimits = (data.chart || []).map(point => ({
        ...point,
        centerLine: data.centerLine,
        ucl: data.ucl,
        lcl: data.lcl
      }));
      setCChartData({ ...data, chart: chartWithLimits });
    } catch (err) {
      console.error('Error fetching c-chart:', err);
      const data = getSampleCChart();
      const chartWithLimits = data.chart.map(point => ({
        ...point,
        centerLine: data.centerLine,
        ucl: data.ucl,
        lcl: data.lcl
      }));
      setCChartData({ ...data, chart: chartWithLimits });
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessCapability = async () => {
    setLoading(true);
    try {
      const res = await API.get('/spc/process-capability?parameter=ph');
      setProcessCapability(res.data);
    } catch (err) {
      console.error('Error fetching process capability:', err);
      setProcessCapability(getSampleCapability());
    } finally {
      setLoading(false);
    }
  };

  const getSamplePChart = () => ({
    chart: Array.from({ length: 20 }, (_, i) => ({
      subgroup: i + 1,
      fractionDefective: 0.05 + Math.random() * 0.1,
      sampleSize: 10
    })),
    centerLine: 0.08,
    ucl: 0.15,
    lcl: 0.01
  });

  const getSampleCChart = () => ({
    chart: Array.from({ length: 20 }, (_, i) => ({
      sample: i + 1,
      defectCount: Math.floor(2 + Math.random() * 5)
    })),
    centerLine: 3.5,
    ucl: 8.2,
    lcl: 0
  });

  const getSampleCapability = () => ({
    parameter: 'pH',
    cp: 1.25,
    cpk: 1.15,
    pp: 1.20,
    ppk: 1.10,
    specification: { lower: 6.5, upper: 8.5, target: 7.0 },
    processMean: 7.2,
    processStdDev: 0.3,
    interpretation: 'Process is capable and centered'
  });

  return (
    <div className="process-capability-container">
      <div className="pc-header">
        <h1>Process Capability & Control Charts for Attributes</h1>
        <p className="pc-subtitle">Unit 3B: Control Charts for Attributes, Process Capability, Process Performance</p>
      </div>

      <div className="pc-tabs">
        <button
          className={`tab-btn ${activeTab === 'p-chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('p-chart')}
        >
          p-Chart (Fraction Defective)
        </button>
        <button
          className={`tab-btn ${activeTab === 'c-chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('c-chart')}
        >
          c-Chart (Defect Count)
        </button>
        <button
          className={`tab-btn ${activeTab === 'capability' ? 'active' : ''}`}
          onClick={() => setActiveTab('capability')}
        >
          Process Capability
        </button>
      </div>

      <div className="pc-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'p-chart' && pChartData && (
              <div className="chart-panel">
                <h2>p-Chart: Fraction Defective</h2>
                <p className="chart-desc">
                  Monitors the proportion of defective items in samples (attribute data)
                </p>
                <div className="chart-controls">
                  <div className="control-info">
                    <span><strong>Center Line (p̄):</strong> {pChartData.centerLine.toFixed(3)}</span>
                    <span><strong>UCL:</strong> {pChartData.ucl.toFixed(3)}</span>
                    <span><strong>LCL:</strong> {pChartData.lcl.toFixed(3)}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={pChartData.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subgroup" label={{ value: 'Subgroup', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Fraction Defective', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fractionDefective" stroke="#3b82f6" name="Fraction Defective" />
                    <Line type="monotone" dataKey="centerLine" stroke="#10b981" strokeDasharray="5 5" name="Center Line" />
                    <Line type="monotone" dataKey="ucl" stroke="#ef4444" strokeDasharray="5 5" name="UCL" />
                    <Line type="monotone" dataKey="lcl" stroke="#ef4444" strokeDasharray="5 5" name="LCL" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="chart-interpretation">
                  <h3>Interpretation:</h3>
                  <p>The p-chart monitors the proportion of non-compliant samples. Points outside control limits indicate special causes.</p>
                </div>
              </div>
            )}

            {activeTab === 'c-chart' && cChartData && (
              <div className="chart-panel">
                <h2>c-Chart: Defect Count</h2>
                <p className="chart-desc">
                  Monitors the number of defects per unit or sample (attribute data)
                </p>
                <div className="chart-controls">
                  <div className="control-info">
                    <span><strong>Center Line (c̄):</strong> {cChartData.centerLine.toFixed(2)}</span>
                    <span><strong>UCL:</strong> {cChartData.ucl.toFixed(2)}</span>
                    <span><strong>LCL:</strong> {cChartData.lcl.toFixed(2)}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={cChartData.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sample" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Defect Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="defectCount" stroke="#8b5cf6" name="Defect Count" />
                    <Line type="monotone" dataKey="centerLine" stroke="#10b981" strokeDasharray="5 5" name="Center Line" />
                    <Line type="monotone" dataKey="ucl" stroke="#ef4444" strokeDasharray="5 5" name="UCL" />
                    <Line type="monotone" dataKey="lcl" stroke="#ef4444" strokeDasharray="5 5" name="LCL" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="chart-interpretation">
                  <h3>Interpretation:</h3>
                  <p>The c-chart monitors the number of defects per sample. Used when sample size is constant.</p>
                </div>
              </div>
            )}

            {activeTab === 'capability' && processCapability && (
              <div className="capability-panel">
                <h2>Process Capability Analysis</h2>
                <p className="chart-desc">
                  Measures how well a process meets specification requirements
                </p>
                <div className="capability-metrics">
                  <div className="metric-card">
                    <h3>Cp (Process Capability)</h3>
                    <div className="metric-value">{processCapability.cp.toFixed(2)}</div>
                    <p className="metric-desc">Measures process spread relative to specification</p>
                    <div className={`metric-status ${processCapability.cp >= 1.33 ? 'good' : processCapability.cp >= 1.0 ? 'acceptable' : 'poor'}`}>
                      {processCapability.cp >= 1.33 ? '✓ Capable' : processCapability.cp >= 1.0 ? '⚠ Marginal' : '✗ Not Capable'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h3>Cpk (Process Capability Index)</h3>
                    <div className="metric-value">{processCapability.cpk.toFixed(2)}</div>
                    <p className="metric-desc">Measures process centering and spread</p>
                    <div className={`metric-status ${processCapability.cpk >= 1.33 ? 'good' : processCapability.cpk >= 1.0 ? 'acceptable' : 'poor'}`}>
                      {processCapability.cpk >= 1.33 ? '✓ Capable' : processCapability.cpk >= 1.0 ? '⚠ Marginal' : '✗ Not Capable'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h3>Pp (Process Performance)</h3>
                    <div className="metric-value">{processCapability.pp.toFixed(2)}</div>
                    <p className="metric-desc">Long-term process performance</p>
                    <div className={`metric-status ${processCapability.pp >= 1.33 ? 'good' : processCapability.pp >= 1.0 ? 'acceptable' : 'poor'}`}>
                      {processCapability.pp >= 1.33 ? '✓ Good' : processCapability.pp >= 1.0 ? '⚠ Marginal' : '✗ Poor'}
                    </div>
                  </div>
                  <div className="metric-card">
                    <h3>Ppk (Process Performance Index)</h3>
                    <div className="metric-value">{processCapability.ppk.toFixed(2)}</div>
                    <p className="metric-desc">Long-term capability considering centering</p>
                    <div className={`metric-status ${processCapability.ppk >= 1.33 ? 'good' : processCapability.ppk >= 1.0 ? 'acceptable' : 'poor'}`}>
                      {processCapability.ppk >= 1.33 ? '✓ Good' : processCapability.ppk >= 1.0 ? '⚠ Marginal' : '✗ Poor'}
                    </div>
                  </div>
                </div>
                <div className="capability-details">
                  <h3>Process Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Parameter:</strong> {processCapability.parameter}
                    </div>
                    <div className="detail-item">
                      <strong>Process Mean:</strong> {processCapability.processMean.toFixed(2)}
                    </div>
                    <div className="detail-item">
                      <strong>Process Std Dev:</strong> {processCapability.processStdDev.toFixed(2)}
                    </div>
                    <div className="detail-item">
                      <strong>Specification:</strong> {processCapability.specification.lower} - {processCapability.specification.upper}
                    </div>
                    <div className="detail-item">
                      <strong>Target:</strong> {processCapability.specification.target}
                    </div>
                  </div>
                  <div className="interpretation-box">
                    <strong>Interpretation:</strong> {processCapability.interpretation}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

