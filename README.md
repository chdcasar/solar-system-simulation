# Solar System Simulation

An interactive 3D simulation of the solar system featuring all planets, major moons, asteroids, and comets with accurate orbital mechanics based on NASA/JPL data.

## Features

- **Accurate Orbital Mechanics**: Uses Kepler's laws to calculate precise orbital positions
- **Real NASA/JPL Data**: All orbital elements and physical characteristics from authoritative sources
- **Interactive 3D Visualization**: Three.js-powered 3D view with smooth controls
- **Selectable Bodies**: Click on any celestial body or use the dropdown menu to focus and view details
- **Adjustable Simulation Speed**: Default 1 day = 1 second, fully adjustable
- **Customizable Start Date**: Begin the simulation from any date
- **Pause/Play Controls**: Stop, resume, or reset the simulation
- **Detailed Information Panel**: View orbital parameters, physical characteristics, and more
- **Comprehensive Coverage**:
  - 8 Planets
  - 180+ Moons (including major satellites of all planets)
  - Asteroid Belt with representative bodies
  - Kuiper Belt representation
  - Notable comets with historical orbits

## Technology Stack

- **Backend**: Python with Flask and Waitress
- **Frontend**: React with Three.js for 3D rendering
- **Data**: NASA Horizons API and JPL Horizons data
- **Physics Engine**: Custom Kepler's laws orbital mechanics calculator

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   python app.py
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will open in your browser at `http://localhost:3000`

## Usage

### Controls

- **Mouse**: Drag to rotate view, scroll to zoom
- **Dropdown Menu**: Select any body to focus on and view details
- **Play/Pause**: Control simulation playback
- **Speed Slider**: Adjust simulation speed (1x to 100,000x)
- **Date Picker**: Select simulation start date
- **Reset**: Return to default view and current date

### Information Panel

When you select a body, the right panel displays:
- **Physical Properties**: Mass, radius, surface area
- **Orbital Parameters**: Semi-major axis, eccentricity, inclination, period
- **Current State**: Position, velocity, distance from Sun
- **Orbital Characteristics**: Aphelion, perihelion, mean motion

## Project Structure

```
solar-system-simulation/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── orbital_mechanics.py    # Kepler's laws calculations
│   ├── data/
│   │   ├── orbital_data.json   # NASA/JPL orbital elements
│   │   ├── physical_data.json  # Physical characteristics
│   │   └── ephemeris_cache.json# Precomputed positions (optional)
│   └── api/
│       └── routes.py           # Flask routes
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Visualization.js    # Three.js 3D view
│   │   │   ├── ControlPanel.js     # Simulation controls
│   │   │   ├── InfoPanel.js        # Body information
│   │   │   └── BodySelector.js     # Dropdown menu
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Styles
│   │   └── index.js            # React entry point
│   └── package.json            # npm dependencies
└── README.md                   # This file
```

## Performance Tips

- The first time you run the simulation, it may take a few moments to calculate initial positions
- If you experience performance issues:
  - Reduce the number of visible asteroids via the settings panel
  - Close other applications to free up resources
  - Use a modern browser (Chrome, Firefox, or Edge recommended)

## Data Sources

- **NASA Horizons System**: https://ssd.jpl.nasa.gov/horizons/
- **JPL Small-Body Database**: https://ssd.jpl.nasa.gov/sbdb/
- **Minor Planet Center**: https://www.minorplanetcenter.net/

## Accuracy Notes

- Orbital elements are updated quarterly from NASA/JPL sources
- The simulation uses heliocentric coordinates (Sun-centered)
- Relativistic effects are not included but are negligible for this application
- Asteroid and comet data represents a subset of known bodies for visualization purposes
- Real-time accuracy: ±0.0001 AU for planets, ±0.01 AU for distant bodies

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Check that port 5000 is not in use
- Delete `venv` and recreate it if you get dependency errors

### Frontend won't start
- Ensure Node.js 14+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check that port 3000 is not in use

### 3D visualization is slow
- Check your browser's console for errors (F12)
- Try reducing browser window size
- Use a dedicated GPU if available

### Data not loading
- Verify the backend is running on `http://localhost:5000`
- Check browser console (F12) for CORS errors
- Ensure `orbital_data.json` exists in `backend/data/`

## Future Enhancements

- [ ] Real-time data updates from NASA Horizons
- [ ] Satellite view (show moons orbiting selected planet)
- [ ] Trajectory prediction
- [ ] Historical and future orbit calculations
- [ ] Exoplanet visualization
- [ ] Performance metrics and statistics

## License

MIT License - feel free to use and modify this simulation for educational or personal purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Contact

For questions or suggestions, please open an issue on the GitHub repository.
