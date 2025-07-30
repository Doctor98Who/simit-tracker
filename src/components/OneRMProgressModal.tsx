import React, { useContext, useMemo, useState } from 'react';
import { DataContext } from '../DataContext';
import { calculateOneRM, getOneRMHistory, OneRMData } from '../data/OneRMCalculator';

interface OneRMProgressModalProps {
  exercise: { name: string; subtype?: string };
  onClose: () => void;
}

const OneRMProgressModal: React.FC<OneRMProgressModalProps> = ({ exercise, onClose }) => {
  const { data } = useContext(DataContext);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  
  const oneRMData = useMemo(() => {
    return getOneRMHistory(data.history, exercise.name, exercise.subtype);
  }, [data.history, exercise]);
  
  const programNames = useMemo(() => {
    const programs = new Set<string>();
    oneRMData.forEach(entry => {
      if (entry.programName) programs.add(entry.programName);
    });
    return Array.from(programs);
  }, [oneRMData]);
  
  const chartData = useMemo(() => {
    if (selectedPrograms.length === 0) return oneRMData;
    return oneRMData.filter(entry => entry.programName && selectedPrograms.includes(entry.programName));
  }, [oneRMData, selectedPrograms]);
  
  const maxOneRM = Math.max(...chartData.map(d => d.estimated1RM), 0);
  const minOneRM = Math.min(...chartData.map(d => d.estimated1RM), Infinity);
  const dateRange = chartData.length > 0 
    ? { min: chartData[0].date, max: chartData[chartData.length - 1].date }
    : { min: Date.now(), max: Date.now() };
  
  const toggleProgram = (programName: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programName) 
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    );
  };
  
  const chartHeight = 300;
  const chartWidth = 350;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'var(--bg-dark)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 2000,
      maxWidth: '400px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1em', color: 'var(--text)' }}>
          1RM Progress: {exercise.name} {exercise.subtype && `(${exercise.subtype})`}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.2em',
            cursor: 'pointer',
            padding: '4px',
            minHeight: 'auto',
          }}
        >
          ×
        </button>
      </div>
      
      {programNames.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Filter by Program:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {programNames.map(program => (
              <button
                key={program}
                onClick={() => toggleProgram(program)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: selectedPrograms.includes(program) ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  color: selectedPrograms.includes(program) ? 'white' : 'var(--text)',
                  fontSize: '0.8em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {program}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No 1RM data available for this exercise
        </div>
      ) : (
        <div style={{ background: 'var(--bg-lighter)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <svg width={chartWidth} height={chartHeight}>
            {/* Y-axis */}
            <line 
              x1={padding.left} 
              y1={padding.top} 
              x2={padding.left} 
              y2={chartHeight - padding.bottom}
              stroke="var(--border)"
              strokeWidth="1"
            />
            
            {/* X-axis */}
            <line 
              x1={padding.left} 
              y1={chartHeight - padding.bottom} 
              x2={chartWidth - padding.right} 
              y2={chartHeight - padding.bottom}
              stroke="var(--border)"
              strokeWidth="1"
            />
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => {
              const value = minOneRM + (maxOneRM - minOneRM) * (i / 4);
              const y = chartHeight - padding.bottom - (i / 4) * plotHeight;
              return (
                <g key={i}>
                  <line 
                    x1={padding.left - 5} 
                    y1={y} 
                    x2={padding.left} 
                    y2={y}
                    stroke="var(--border)"
                  />
                  <text 
                    x={padding.left - 10} 
                    y={y + 4} 
                    textAnchor="end" 
                    fontSize="10" 
                    fill="var(--text-muted)"
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}
            
            {/* Plot data points and lines */}
            {chartData.map((point, index) => {
              const x = padding.left + ((point.date - dateRange.min) / (dateRange.max - dateRange.min)) * plotWidth;
              const y = chartHeight - padding.bottom - ((point.estimated1RM - minOneRM) / (maxOneRM - minOneRM)) * plotHeight;
              
              return (
                <g key={index}>
                  {index > 0 && (
                    <line
                      x1={padding.left + ((chartData[index - 1].date - dateRange.min) / (dateRange.max - dateRange.min)) * plotWidth}
                      y1={chartHeight - padding.bottom - ((chartData[index - 1].estimated1RM - minOneRM) / (maxOneRM - minOneRM)) * plotHeight}
                      x2={x}
                      y2={y}
                      stroke="var(--accent-primary)"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  )}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="var(--accent-primary)"
                    style={{ cursor: 'pointer' }}
                  >
                    <title>
                      {new Date(point.date).toLocaleDateString()}: {point.estimated1RM} {data.weightUnit}
                      {'\n'}{point.weight} × {point.reps} @ RPE {point.rpe}
                    </title>
                  </circle>
                </g>
              );
            })}
          </svg>
          
          <div style={{ 
            marginTop: '16px', 
            textAlign: 'center', 
            fontSize: '0.85em', 
            color: 'var(--text-muted)' 
          }}>
            Current Estimated 1RM: <span style={{ 
              color: 'var(--accent-primary)', 
              fontWeight: '600',
              fontSize: '1.1em' 
            }}>
              {chartData[chartData.length - 1]?.estimated1RM || 0} {data.weightUnit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneRMProgressModal;