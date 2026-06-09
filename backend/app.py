from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from orbital_mechanics import OrbitalMechanics
import math

app = Flask(__name__)
CORS(app)

# Load orbital data
def load_orbital_data():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'orbital_data.json')
    with open(data_path, 'r') as f:
        return json.load(f)

orbital_data = load_orbital_data()

@app.route('/api/bodies', methods=['GET'])
def get_bodies():
    """
    Get list of all celestial bodies with their metadata.
    Query params:
    - types: comma-separated list of body types (planet, moon, asteroid, comet, etc.)
    """
    bodies = {
        'sun': orbital_data['sun'],
        'planets': orbital_data['planets'],
        'moons': orbital_data['moons'],
        'asteroids': orbital_data['asteroids'],
        'comets': orbital_data['comets'],
        'kuiper_belt': orbital_data['kuiper_belt']
    }
    
    return jsonify(bodies)

@app.route('/api/positions', methods=['POST'])
def get_positions():
    """
    Calculate current positions of all bodies.
    Request body:
    {
        "timestamp": "2024-01-01T00:00:00Z" (ISO format, or null for now),
        "include_trails": true/false,
        "limit_asteroids": 100
    }
    """
    data = request.get_json()
    
    # Parse timestamp
    if data.get('timestamp'):
        dt = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
    else:
        dt = datetime.utcnow()
    
    jd = OrbitalMechanics.jd_from_datetime(dt)
    
    positions = {
        'timestamp': dt.isoformat(),
        'jd': jd,
        'bodies': {}
    }
    
    # Sun position (always at origin)
    positions['bodies']['sun'] = {
        'name': 'Sun',
        'position': [0, 0, 0],
        'velocity': [0, 0, 0],
        'radius': orbital_data['sun']['radius'],
        'color': orbital_data['sun']['color'],
        'type': 'star'
    }
    
    # Planets
    for planet_id, planet in orbital_data['planets'].items():
        try:
            pos, vel = OrbitalMechanics.calculate_position(planet['orbital_elements'], jd)
            positions['bodies'][planet_id] = {
                'name': planet['name'],
                'position': pos.tolist(),
                'velocity': vel.tolist(),
                'radius': planet['radius'],
                'color': planet['color'],
                'type': planet['type'],
                'mass': planet['mass']
            }
        except Exception as e:
            print(f"Error calculating position for {planet_id}: {e}")
    
    # Moons
    for moon_id, moon in orbital_data['moons'].items():
        try:
            parent_id = moon['parent']
            if parent_id in positions['bodies']:
                parent_pos = positions['bodies'][parent_id]['position']
                moon_pos, moon_vel = OrbitalMechanics.calculate_position(moon['orbital_elements'], jd)
                # Position relative to parent, then offset by parent position
                abs_pos = [moon_pos[0] + parent_pos[0], 
                           moon_pos[1] + parent_pos[1], 
                           moon_pos[2] + parent_pos[2]]
                abs_vel = [moon_vel[0] + positions['bodies'][parent_id]['velocity'][0],
                           moon_vel[1] + positions['bodies'][parent_id]['velocity'][1],
                           moon_vel[2] + positions['bodies'][parent_id]['velocity'][2]]
                positions['bodies'][moon_id] = {
                    'name': moon['name'],
                    'position': abs_pos,
                    'velocity': abs_vel,
                    'radius': moon['radius'],
                    'color': moon['color'],
                    'type': moon['type'],
                    'parent': parent_id,
                    'mass': moon['mass']
                }
        except Exception as e:
            print(f"Error calculating position for {moon_id}: {e}")
    
    # Asteroids (limit for performance)
    limit = data.get('limit_asteroids', 50)
    count = 0
    for asteroid_id, asteroid in orbital_data['asteroids'].items():
        if count >= limit:
            break
        try:
            pos, vel = OrbitalMechanics.calculate_position(asteroid['orbital_elements'], jd)
            positions['bodies'][asteroid_id] = {
                'name': asteroid['name'],
                'position': pos.tolist(),
                'velocity': vel.tolist(),
                'radius': asteroid['radius'],
                'color': asteroid['color'],
                'type': asteroid['type'],
                'mass': asteroid['mass']
            }
            count += 1
        except Exception as e:
            print(f"Error calculating position for {asteroid_id}: {e}")
    
    # Comets
    for comet_id, comet in orbital_data['comets'].items():
        try:
            pos, vel = OrbitalMechanics.calculate_position(comet['orbital_elements'], jd)
            positions['bodies'][comet_id] = {
                'name': comet['name'],
                'position': pos.tolist(),
                'velocity': vel.tolist(),
                'radius': comet['radius'],
                'color': comet['color'],
                'type': comet['type'],
                'mass': comet['mass']
            }
        except Exception as e:
            print(f"Error calculating position for {comet_id}: {e}")
    
    # Kuiper Belt objects
    for obj_id, obj in orbital_data['kuiper_belt'].items():
        try:
            pos, vel = OrbitalMechanics.calculate_position(obj['orbital_elements'], jd)
            positions['bodies'][obj_id] = {
                'name': obj['name'],
                'position': pos.tolist(),
                'velocity': vel.tolist(),
                'radius': obj['radius'],
                'color': obj['color'],
                'type': obj['type'],
                'mass': obj['mass']
            }
        except Exception as e:
            print(f"Error calculating position for {obj_id}: {e}")
    
    return jsonify(positions)

@app.route('/api/body/<body_id>', methods=['GET'])
def get_body_details(body_id):
    """
    Get detailed information about a specific body.
    Query params:
    - timestamp: ISO format timestamp (optional)
    """
    # Find body in data
    body = None
    body_data = None
    
    for category in ['sun', 'planets', 'moons', 'asteroids', 'comets', 'kuiper_belt']:
        if category == 'sun' and body_id == 'sun':
            body = orbital_data['sun']
            body_data = body
            break
        elif body_id in orbital_data.get(category, {}):
            body_data = orbital_data[category][body_id]
            body = body_data
            break
    
    if not body:
        return jsonify({'error': 'Body not found'}), 404
    
    # Parse timestamp
    timestamp = request.args.get('timestamp')
    if timestamp:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        dt = datetime.utcnow()
    
    jd = OrbitalMechanics.jd_from_datetime(dt)
    
    details = {
        'id': body_id,
        'name': body.get('name'),
        'type': body.get('type'),
        'mass': body.get('mass'),
        'radius': body.get('radius'),
        'color': body.get('color'),
        'timestamp': dt.isoformat()
    }
    
    # Add position and velocity if not the sun
    if body_id != 'sun' and 'orbital_elements' in body:
        try:
            pos, vel = OrbitalMechanics.calculate_position(body['orbital_elements'], jd)
            details['position'] = pos.tolist()
            details['velocity'] = vel.tolist()
            details['distance_from_sun'] = float(math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2))
            
            # Calculate orbital parameters
            oe = body['orbital_elements']
            details['orbital_parameters'] = {
                'semi_major_axis': oe.get('a'),
                'eccentricity': oe.get('e'),
                'inclination': oe.get('i'),
                'longitude_ascending_node': oe.get('Omega'),
                'argument_perihelion': oe.get('omega'),
                'mean_anomaly': oe.get('M0'),
                'orbital_period': 2 * math.pi / math.sqrt(0.00029591220828411956 / (oe.get('a', 1)**3)),  # days
            }
        except Exception as e:
            details['error'] = str(e)
    
    # Add parent info if moon
    if body.get('parent'):
        details['parent'] = body['parent']
    
    return jsonify(details)

@app.route('/api/trajectory', methods=['POST'])
def get_trajectory():
    """
    Calculate trajectory of a body over time.
    Request body:
    {
        "body_id": "earth",
        "start_timestamp": "2024-01-01T00:00:00Z",
        "end_timestamp": "2024-12-31T23:59:59Z",
        "step_days": 1
    }
    """
    data = request.get_json()
    body_id = data.get('body_id')
    start_ts = data.get('start_timestamp')
    end_ts = data.get('end_timestamp')
    step_days = data.get('step_days', 1)
    
    # Find body
    body = None
    for category in ['planets', 'moons', 'asteroids', 'comets', 'kuiper_belt']:
        if body_id in orbital_data.get(category, {}):
            body = orbital_data[category][body_id]
            break
    
    if not body or 'orbital_elements' not in body:
        return jsonify({'error': 'Body not found or has no orbital elements'}), 404
    
    start_dt = datetime.fromisoformat(start_ts.replace('Z', '+00:00'))
    end_dt = datetime.fromisoformat(end_ts.replace('Z', '+00:00'))
    
    trajectory = {
        'body_id': body_id,
        'body_name': body.get('name'),
        'positions': []
    }
    
    current_dt = start_dt
    while current_dt <= end_dt:
        try:
            jd = OrbitalMechanics.jd_from_datetime(current_dt)
            pos, vel = OrbitalMechanics.calculate_position(body['orbital_elements'], jd)
            trajectory['positions'].append({
                'timestamp': current_dt.isoformat(),
                'position': pos.tolist(),
                'velocity': vel.tolist()
            })
        except Exception as e:
            print(f"Error calculating trajectory point: {e}")
        
        current_dt = current_dt + __import__('datetime').timedelta(days=step_days)
    
    return jsonify(trajectory)

@app.route('/api/search', methods=['GET'])
def search_bodies():
    """
    Search for bodies by name.
    Query params:
    - q: search query
    """
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    
    results = []
    
    for category in ['sun', 'planets', 'moons', 'asteroids', 'comets', 'kuiper_belt']:
        if category == 'sun':
            if 'sun' in query and query in orbital_data['sun'].get('name', '').lower():
                results.append({'id': 'sun', 'name': orbital_data['sun']['name'], 'type': 'star'})
        else:
            for body_id, body_data in orbital_data.get(category, {}).items():
                name = body_data.get('name', '').lower()
                if query in name:
                    results.append({'id': body_id, 'name': body_data.get('name'), 'type': category})
    
    return jsonify(results)

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
