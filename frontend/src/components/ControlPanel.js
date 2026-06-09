import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ 
  currentTime, 
  isPaused, 
  simSpeed, 
  onPlayPause, 
  onReset, 
  onSpeedChange, 
  onDateChange 
}) => {
  const speedOptions = [
    { label: '1x (1 day/sec)', value: 1 },
    { label: '10x', value: 10 },
    { label: '100x', value: 100 },
    { label: '1000x', value: 1000 },
    { label: '10000x', value: 10000 },
    { label: '100000x', value: 100000 }
  ];

  return (
    <div className="control-panel">
      <div className="control-section">
        <h3>Simulation Controls</h3>
        
        <div className="time-display">
          <label>Simulation Time:</label>
          <span className="time-value">{currentTime.toUTCString()}</span>
        </div>

        <div className="control-buttons">
          <button 
            className={`btn ${isPaused ? 'btn-play' : 'btn-pause'}`}
            onClick={onPlayPause}
          >
            {isPaused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button className="btn btn-reset" onClick={onReset}>
            ↻ Reset
          </button>
        </div>

        <div className="speed-control">
          <label>Simulation Speed:</label>
          <select 
            value={simSpeed} 
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="speed-select"
          >
            {speedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="speed-display">Current: {simSpeed}x</span>
        </div>

        <div className="date-control">
          <label>Jump to Date:</label>
          <input 
            type="datetime-local"
            value={currentTime.toISOString().slice(0, 16)}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="date-input"
          />
        </div>

        <div className="info-text">
          <p><strong>Mouse Controls:</strong></p>
          <ul>
            <li>Drag to rotate view</li>
            <li>Scroll to zoom</li>
            <li>Click body to select</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
