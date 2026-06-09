import React, { useState } from 'react';
import './BodySelector.css';

const BodySelector = ({ bodyList, selectedBody, onBodySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBodies = bodyList.filter(body =>
    body.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group bodies by type
  const groupedBodies = {
    'Sun': [],
    'Planets': [],
    'Moons': [],
    'Asteroids': [],
    'Comets': [],
    'Kuiper Belt': [],
    'Other': []
  };

  filteredBodies.forEach(body => {
    switch (body.type) {
      case 'star':
        groupedBodies['Sun'].push(body);
        break;
      case 'terrestrial':
      case 'gas_giant':
      case 'ice_giant':
        groupedBodies['Planets'].push(body);
        break;
      case 'moon':
        groupedBodies['Moons'].push(body);
        break;
      case 'asteroid':
      case 'dwarf_planet':
        groupedBodies['Asteroids'].push(body);
        break;
      case 'comet':
        groupedBodies['Comets'].push(body);
        break;
      case 'kuiper_belt':
        groupedBodies['Kuiper Belt'].push(body);
        break;
      default:
        groupedBodies['Other'].push(body);
    }
  });

  return (
    <div className="body-selector">
      <div className="selector-header">
        <h3>Celestial Bodies</h3>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search bodies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="body-list">
        {Object.entries(groupedBodies).map(([group, bodies]) =>
          bodies.length > 0 && (
            <div key={group} className="body-group">
              <h4 className="group-title">{group}</h4>
              {bodies.map(body => (
                <button
                  key={body.id}
                  className={`body-item ${selectedBody === body.id ? 'active' : ''}`}
                  onClick={() => onBodySelect(body.id)}
                  title={body.name}
                >
                  <span className="body-name">{body.name}</span>
                  <span className={`body-type badge badge-${body.type}`}>
                    {body.type.replace(/_/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          )
        )}

        {filteredBodies.length === 0 && (
          <div className="no-results">
            No bodies found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default BodySelector;
