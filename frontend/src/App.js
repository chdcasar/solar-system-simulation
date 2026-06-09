import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Visualization from './components/Visualization';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import BodySelector from './components/BodySelector';
import axios from 'axios';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [simSpeed, setSimSpeed] = useState(1); // days per second (1 day = 1 second)
  const [isPaused, setIsPaused] = useState(true);
  const [selectedBody, setSelectedBody] = useState('sun');
  const [bodies, setBodies] = useState({});
  const [positions, setPositions] = useState({});
  const [bodyList, setBodyList] = useState([]);
  const [error, setError] = useState(null);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Fetch available bodies
  useEffect(() => {
    const fetchBodies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bodies');
        setBodies(response.data);
        
        // Create flat list of all bodies for dropdown
        const list = [];
        list.push({ id: 'sun', name: 'Sun', type: 'star' });
        
        if (response.data.planets) {
          Object.entries(response.data.planets).forEach(([id, planet]) => {
            list.push({ id, name: planet.name, type: 'planet' });
          });
        }
        
        if (response.data.moons) {
          Object.entries(response.data.moons).forEach(([id, moon]) => {
            list.push({ id, name: moon.name, type: 'moon' });
          });
        }
        
        if (response.data.asteroids) {
          Object.entries(response.data.asteroids).forEach(([id, asteroid]) => {
            list.push({ id, name: asteroid.name, type: 'asteroid' });
          });
        }
        
        if (response.data.comets) {
          Object.entries(response.data.comets).forEach(([id, comet]) => {
            list.push({ id, name: comet.name, type: 'comet' });
          });
        }
        
        if (response.data.kuiper_belt) {
          Object.entries(response.data.kuiper_belt).forEach(([id, obj]) => {
            list.push({ id, name: obj.name, type: 'kuiper_belt' });
          });
        }
        
        setBodyList(list);
      } catch (err) {
        setError('Failed to load celestial bodies: ' + err.message);
        console.error('Error fetching bodies:', err);
      }
    };
    
    fetchBodies();
  }, []);

  // Fetch positions
  const updatePositions = async (time) => {
    try {
      const response = await axios.post('http://localhost:5000/api/positions', {
        timestamp: time.toISOString(),
        include_trails: false,
        limit_asteroids: 100
      });
      setPositions(response.data);
    } catch (err) {
      console.error('Error fetching positions:', err);
    }
  };

  // Initial position fetch
  useEffect(() => {
    updatePositions(currentTime);
  }, [currentTime]);

  // Animation loop
  useEffect(() => {
    if (isPaused) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      setCurrentTime(prevTime => {
        const newTime = new Date(prevTime.getTime() + deltaTime * simSpeed * 86400000); // deltaTime * simSpeed * ms per day
        return newTime;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastUpdateRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, simSpeed]);

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setCurrentTime(new Date());
    setIsPaused(true);
  };

  const handleSpeedChange = (speed) => {
    setSimSpeed(speed);
  };

  const handleDateChange = (date) => {
    setCurrentTime(new Date(date));
  };

  const handleBodySelect = (bodyId) => {
    setSelectedBody(bodyId);
  };

  return (
    <div className="App">
      <div className="main-container">
        <div className="visualization-container">
          <Visualization 
            positions={positions} 
            selectedBody={selectedBody}
            onBodySelect={handleBodySelect}
          />
          <ControlPanel 
            currentTime={currentTime}
            isPaused={isPaused}
            simSpeed={simSpeed}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            onDateChange={handleDateChange}
          />
        </div>
        <div className="side-panel">
          <BodySelector 
            bodyList={bodyList}
            selectedBody={selectedBody}
            onBodySelect={handleBodySelect}
          />
          <InfoPanel 
            selectedBodyId={selectedBody}
            currentTime={currentTime}
          />
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
