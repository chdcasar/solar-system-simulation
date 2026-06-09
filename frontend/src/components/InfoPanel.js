import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InfoPanel.css';

const InfoPanel = ({ selectedBodyId, currentTime }) => {
  const [bodyDetails, setBodyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedBodyId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/body/${selectedBodyId}?timestamp=${currentTime.toISOString()}`
        );
        setBodyDetails(response.data);
      } catch (err) {
        setError('Failed to load body details: ' + err.message);
        console.error('Error fetching body details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedBodyId, currentTime]);

  if (loading) {
    return <div className="info-panel"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return <div className="info-panel"><div className="error">{error}</div></div>;
  }

  if (!bodyDetails) {
    return <div className="info-panel"><div className="placeholder">Select a body to view details</div></div>;
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return parseFloat(num).toExponential(3);
  };

  const { orbital_parameters } = bodyDetails;

  return (
    <div className="info-panel">
      <div className="info-header">
        <h2>{bodyDetails.name}</h2>
        <span className={`badge badge-${bodyDetails.type}`}>{bodyDetails.type}</span>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h3>Physical Properties</h3>
          <div className="info-item">
            <label>Mass (Earth masses):</label>
            <value>{formatNumber(bodyDetails.mass)}</value>
          </div>
          <div className="info-item">
            <label>Radius (AU):</label>
            <value>{formatNumber(bodyDetails.radius)}</value>
          </div>
          {bodyDetails.distance_from_sun !== undefined && (
            <div className="info-item">
              <label>Distance from Sun (AU):</label>
              <value>{formatNumber(bodyDetails.distance_from_sun)}</value>
            </div>
          )}
        </section>

        {orbital_parameters && (
          <section className="info-section">
            <h3>Orbital Parameters</h3>
            <div className="info-item">
              <label>Semi-major Axis (AU):</label>
              <value>{formatNumber(orbital_parameters.semi_major_axis)}</value>
            </div>
            <div className="info-item">
              <label>Eccentricity:</label>
              <value>{formatNumber(orbital_parameters.eccentricity)}</value>
            </div>
            <div className="info-item">
              <label>Inclination (°):</label>
              <value>{formatNumber(orbital_parameters.inclination)}</value>
            </div>
            <div className="info-item">
              <label>Orbital Period (days):</label>
              <value>{formatNumber(orbital_parameters.orbital_period)}</value>
            </div>
            <div className="info-item">
              <label>Long. Asc. Node (°):</label>
              <value>{formatNumber(orbital_parameters.longitude_ascending_node)}</value>
            </div>
            <div className="info-item">
              <label>Arg. of Perihelion (°):</label>
              <value>{formatNumber(orbital_parameters.argument_perihelion)}</value>
            </div>
          </section>
        )}

        {bodyDetails.parent && (
          <section className="info-section">
            <h3>Parent Body</h3>
            <div className="info-item">
              <label>Orbits:</label>
              <value>{bodyDetails.parent}</value>
            </div>
          </section>
        )}

        <section className="info-section">
          <h3>Position & Velocity</h3>
          {bodyDetails.position && (
            <>
              <div className="info-item">
                <label>Position (AU):</label>
                <value className="mono">
                  [{bodyDetails.position[0].toFixed(4)}, {bodyDetails.position[1].toFixed(4)}, {bodyDetails.position[2].toFixed(4)}]
                </value>
              </div>
              <div className="info-item">
                <label>Velocity (AU/day):</label>
                <value className="mono">
                  [{bodyDetails.velocity[0].toFixed(6)}, {bodyDetails.velocity[1].toFixed(6)}, {bodyDetails.velocity[2].toFixed(6)}]
                </value>
              </div>
            </>
          )}
        </section>

        <div className="timestamp-note">
          Calculated for: {new Date(bodyDetails.timestamp).toUTCString()}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
