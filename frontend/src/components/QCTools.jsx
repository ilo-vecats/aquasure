import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Cell
} from 'recharts';
import './QCTools.css';

export default function QCTools() {
  const [activeTool, setActiveTool] = useState('pareto');
  const [paretoData, setParetoData] = useState(null);
  const [histogramData, setHistogramData] = useState(null);
  const [scatterData, setScatterData] = useState(null);
  const [fishboneData, setFishboneData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parameter, setParameter] = useState('qualityIndex');
  const [scatterParamX, setScatterParamX] = useState('ph');
  const [scatterParamY, setScatterParamY] = useState('tds');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, parameter, scatterParamX, scatterParamY]);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      switch (activeTool) {
        case 'pareto': {
          try {
            const paretoRes = await API.get('/qc-tools/pareto');
            if (paretoRes.data?.pareto?.length) {
              setParetoData(paretoRes.data);
              setError(null);
            } else {
              setParetoData(paretoRes.data); // Still set data to show message
              setError(null);
            }
          } catch (err) {
            setParetoData(null);
            setError(err.response?.data?.error || 'Unable to generate Pareto chart.');
          }
          break;
        }
        case 'histogram': {
          try {
            const histRes = await API.get(`/qc-tools/histogram?parameter=${parameter}`);
            if (histRes.data?.histogram?.length) {
              const bins = histRes.data.histogram.map((bin, idx) => ({
                id: idx,
                range: `${bin.start.toFixed(2)} - ${bin.end.toFixed(2)}`,
                frequency: Math.round(bin.frequency * 100) / 100,
                count: bin.count
              }));
              setHistogramData({
                bins,
                statistics: histRes.data.statistics,
                parameter: histRes.data.parameter,
                sampleCount: histRes.data.sampleCount
              });
            } else {
              setHistogramData(null);
              setError('Not enough sample data to build a histogram for this parameter.');
            }
          } catch (err) {
            setHistogramData(null);
            setError(err.response?.data?.error || 'Unable to calculate histogram.');
          }
          break;
        }
        case 'scatter': {
          try {
            // Use default parameters if not set
            const paramX = scatterParamX || 'ph';
            const paramY = scatterParamY || 'tds';
            const scatterRes = await API.get(`/qc-tools/scatter?paramX=${paramX}&paramY=${paramY}`);
            if (scatterRes.data?.dataPoints?.length) {
              setScatterData({
                data: scatterRes.data.dataPoints.map(dp => ({ x: dp.x, y: dp.y })),
                correlation: scatterRes.data.correlation,
                strength: scatterRes.data.strength,
                direction: scatterRes.data.direction,
                xParam: scatterRes.data.paramX,
                yParam: scatterRes.data.paramY,
                sampleCount: scatterRes.data.sampleCount
              });
            } else {
              setScatterData(null);
              setError('Not enough paired data points to plot this scatter diagram.');
            }
          } catch (err) {
            setScatterData(null);
            setError(err.response?.data?.error || 'Unable to calculate scatter diagram.');
          }
          break;
        }
        case 'fishbone': {
          try {
            const fishboneRes = await API.get('/qc-tools/fishbone');
            if (fishboneRes.data) {
              setFishboneData(fishboneRes.data);
            } else {
              setFishboneData(null);
              setError('Unable to load fishbone diagram data.');
            }
          } catch (err) {
            setFishboneData(null);
            setError(err.response?.data?.error || 'Unable to load fishbone diagram.');
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Unable to load data for this tool.');
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'pareto', name: 'Pareto Chart', description: '80/20 rule - Identify most common non-compliance causes' },
    { id: 'histogram', name: 'Histogram', description: 'Distribution of parameter values' },
    { id: 'scatter', name: 'Scatter Diagram', description: 'Relationship between two parameters' },
    { id: 'fishbone', name: 'Cause-Effect (Ishikawa)', description: 'Root cause analysis diagram' },
    { id: 'processflow', name: 'Process Flow', description: 'Water quality testing process flow' },
    { id: 'checksheet', name: 'Check Sheet', description: 'Data collection checklist' }
  ];

  return (
    <div className="qc-tools-container">
      <div className="qc-tools-header">
        <h2>7 QC Tools - Quality Control Analysis</h2>
        <p className="qc-tools-description">
          Statistical tools for quality improvement and problem-solving (TQM Unit 3)
        </p>
      </div>

      <div className="qc-tools-nav">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
          >
            <span className="tool-name">{tool.name}</span>
            <span className="tool-desc">{tool.description}</span>
          </button>
        ))}
      </div>

      <div className="qc-tools-content">
        {loading ? (
          <div className="loading">Loading {tools.find(t => t.id === activeTool)?.name}...</div>
        ) : (
          <>
            {error && (
              <div className="tool-error">
                {error}
              </div>
            )}
            {activeTool === 'pareto' && paretoData && (
              <div className="tool-panel">
                <h3>Pareto Chart - Non-Compliance Analysis</h3>
                <p className="tool-summary">
                  Total Non-Compliances: {paretoData.summary?.totalNonCompliances || 0} | 
                  Total Samples: {paretoData.summary?.totalSamples || 0}
                </p>
                {paretoData.summary?.message && (
                  <div className="info-message">{paretoData.summary.message}</div>
                )}
                {paretoData.pareto && paretoData.pareto.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={paretoData.pareto}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Count" />
                        <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="#10b981" strokeWidth={2} name="Cumulative %" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="pareto-insight">
                      <strong>Insight:</strong> Focus improvement efforts on the top 20% of causes that account for 80% of problems.
                    </div>
                  </>
                ) : (
                  <div className="no-data-message">
                    <p>No non-compliance data available. All samples are compliant!</p>
                    <p className="hint">Submit samples with non-compliant parameters to see the Pareto analysis.</p>
                  </div>
                )}
              </div>
            )}

            {activeTool === 'histogram' && histogramData && (
              <div className="tool-panel">
                <h3>Histogram - {parameter} Distribution</h3>
                <div className="parameter-selector">
                  <label>Parameter: </label>
                  <select value={parameter} onChange={(e) => setParameter(e.target.value)}>
                    <option value="qualityIndex">Quality Index</option>
                    <option value="ph">pH</option>
                    <option value="tds">TDS</option>
                    <option value="turbidity">Turbidity</option>
                    <option value="chlorine">Chlorine</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={histogramData.bins}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" label={{ value: parameter, position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#8b5cf6" name="Frequency (%)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="histogram-stats">
                  <p><strong>Mean:</strong> {histogramData.statistics?.mean?.toFixed(2)}</p>
                  <p><strong>Std Dev:</strong> {histogramData.statistics?.stdDev?.toFixed(2)}</p>
                  <p><strong>Min:</strong> {histogramData.statistics?.min?.toFixed(2)}</p>
                  <p><strong>Max:</strong> {histogramData.statistics?.max?.toFixed(2)}</p>
                  <p><strong>Samples:</strong> {histogramData.sampleCount}</p>
                </div>
              </div>
            )}

            {activeTool === 'scatter' && scatterData && (
              <div className="tool-panel">
                <h3>Scatter Diagram - Parameter Relationships</h3>
                <div className="scatter-selector">
                  <div className="parameter-selector">
                    <label>X Parameter: </label>
                    <select value={scatterParamX} onChange={(e) => setScatterParamX(e.target.value)}>
                      <option value="ph">pH</option>
                      <option value="tds">TDS</option>
                      <option value="turbidity">Turbidity</option>
                      <option value="chlorine">Chlorine</option>
                      <option value="qualityIndex">Quality Index</option>
                    </select>
                  </div>
                  <div className="parameter-selector">
                    <label>Y Parameter: </label>
                    <select value={scatterParamY} onChange={(e) => setScatterParamY(e.target.value)}>
                      <option value="qualityIndex">Quality Index</option>
                      <option value="ph">pH</option>
                      <option value="tds">TDS</option>
                      <option value="turbidity">Turbidity</option>
                      <option value="chlorine">Chlorine</option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={scatterData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      name={scatterData.xParam || scatterData.paramX} 
                      label={{ value: scatterData.xParam || scatterData.paramX, position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="y" 
                      name={scatterData.yParam || scatterData.paramY}
                      label={{ value: scatterData.yParam || scatterData.paramY, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Samples" data={scatterData.data} fill="#3b82f6">
                      {scatterData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="scatter-insight">
                  <p><strong>Samples analyzed:</strong> {scatterData.sampleCount || scatterData.data?.length || 0}</p>
                  <p><strong>Correlation coefficient (r):</strong> {scatterData.correlation?.toFixed(3) || 'N/A'}</p>
                  <p><strong>Strength:</strong> {scatterData.strength || 'N/A'} ({scatterData.direction || 'N/A'} relationship)</p>
                  <p><strong>Interpretation:</strong> {
                    scatterData.correlation ? (
                      Math.abs(scatterData.correlation) > 0.7 ? 'Strong correlation' :
                      Math.abs(scatterData.correlation) > 0.3 ? 'Moderate correlation' :
                      'Weak correlation'
                    ) : 'N/A'
                  }</p>
                </div>
              </div>
            )}

            {activeTool === 'fishbone' && fishboneData && (
              <div className="tool-panel">
                <h3>Cause-Effect (Ishikawa) Diagram</h3>
                <div className="fishbone-diagram">
                  <div className="fishbone-effect">
                    <h4>Problem: {fishboneData.problem || 'Water Quality Issues'}</h4>
                  </div>
                  <div className="fishbone-causes">
                    {fishboneData.categories?.map((category, idx) => (
                      <div key={idx} className="cause-category">
                        <h5>{category.name}</h5>
                        <ul>
                          {category.causes.map((cause, cIdx) => (
                            <li key={cIdx}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'processflow' && (
              <div className="tool-panel">
                <h3>Process Flow Diagram - Water Quality Testing</h3>
                <div className="process-flow">
                  <div className="flow-step">1. Sample Collection</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">2. Sample Transport</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">3. Laboratory Testing</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">4. Data Entry</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">5. Quality Index Calculation</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">6. Compliance Check</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">7. Verification</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">8. Reporting</div>
                </div>
              </div>
            )}

            {activeTool === 'checksheet' && (
              <div className="tool-panel">
                <h3>Check Sheet - Data Collection Checklist</h3>
                <div className="checksheet">
                  <table className="checksheet-table">
                    <thead>
                      <tr>
                        <th>Check Item</th>
                        <th>Standard</th>
                        <th>✓</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Sample container properly labeled</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Sample collected at correct location</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>pH measured within 2 hours</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>TDS measurement calibrated</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Turbidity test performed</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Chlorine residual checked</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Temperature recorded</td>
                        <td>Optional</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Data entered in system</td>
                        <td>Required</td>
                        <td><input type="checkbox" /></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

