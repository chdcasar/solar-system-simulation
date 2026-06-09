import numpy as np
from datetime import datetime, timedelta
import math

# Gravitational constant (AU^3 / (solar masses * days^2))
G = 0.00029591220828411956

class OrbitalMechanics:
    """
    Calculate orbital positions using Kepler's laws and orbital elements.
    Uses heliocentric coordinates (Sun at origin).
    """
    
    @staticmethod
    def mean_anomaly_to_eccentric_anomaly(M, e, tolerance=1e-6):
        """
        Convert mean anomaly to eccentric anomaly using Newton-Raphson method.
        
        Args:
            M: Mean anomaly (radians)
            e: Eccentricity
            tolerance: Convergence tolerance
            
        Returns:
            E: Eccentric anomaly (radians)
        """
        # Normalize M to [-pi, pi]
        M = M % (2 * np.pi)
        if M > np.pi:
            M = M - 2 * np.pi
        
        # Initial guess
        E = M + e * np.sin(M) * (1 + e * np.cos(M))
        
        # Newton-Raphson iteration
        for _ in range(100):
            E_new = E + (M - E + e * np.sin(E)) / (1 - e * np.cos(E))
            if abs(E_new - E) < tolerance:
                return E_new
            E = E_new
        
        return E
    
    @staticmethod
    def eccentric_anomaly_to_true_anomaly(E, e):
        """
        Convert eccentric anomaly to true anomaly.
        
        Args:
            E: Eccentric anomaly (radians)
            e: Eccentricity
            
        Returns:
            nu: True anomaly (radians)
        """
        return 2 * np.arctan2(
            np.sqrt(1 + e) * np.sin(E / 2),
            np.sqrt(1 - e) * np.cos(E / 2)
        )
    
    @staticmethod
    def calculate_position(orbital_elements, jd_epoch):
        """
        Calculate 3D heliocentric position using Kepler's laws.
        
        Args:
            orbital_elements: Dict with keys:
                - a: Semi-major axis (AU)
                - e: Eccentricity
                - i: Inclination (degrees)
                - Omega: Longitude of ascending node (degrees)
                - omega: Argument of perihelion (degrees)
                - M0: Mean anomaly at epoch (degrees)
                - epoch: Reference epoch (JD)
                - n: Mean motion (degrees/day) or calculated from a
                
            jd_epoch: Julian Day for calculation
                
        Returns:
            position: [x, y, z] in AU (heliocentric)
            velocity: [vx, vy, vz] in AU/day
        """
        
        a = orbital_elements.get('a', 1.0)
        e = orbital_elements.get('e', 0.0)
        i = np.radians(orbital_elements.get('i', 0.0))
        Omega = np.radians(orbital_elements.get('Omega', 0.0))
        omega = np.radians(orbital_elements.get('omega', 0.0))
        M0 = np.radians(orbital_elements.get('M0', 0.0))
        epoch = orbital_elements.get('epoch', 2451545.0)  # J2000.0
        
        # Calculate mean motion if not provided (Kepler's third law)
        if 'n' in orbital_elements:
            n = np.radians(orbital_elements['n'])
        else:
            # n = sqrt(G*M/a^3), where M=1 solar mass, result in rad/day
            n = np.sqrt(G / (a ** 3))
        
        # Time since epoch in days
        dt = jd_epoch - epoch
        
        # Mean anomaly at current time
        M = M0 + n * dt
        
        # Solve Kepler's equation
        E = OrbitalMechanics.mean_anomaly_to_eccentric_anomaly(M, e)
        
        # True anomaly
        nu = OrbitalMechanics.eccentric_anomaly_to_true_anomaly(E, e)
        
        # Distance from focus
        r = a * (1 - e * np.cos(E))
        
        # Cartesian coordinates in orbital plane
        x_orb = r * np.cos(nu)
        y_orb = r * np.sin(nu)
        z_orb = 0.0
        
        # Velocity in orbital plane
        v_mag = np.sqrt(G * (2 / r - 1 / a))
        vx_orb = -v_mag * np.sin(E) / (1 - e * np.cos(E))
        vy_orb = v_mag * np.sqrt(1 - e**2) * np.cos(E) / (1 - e * np.cos(E))
        vz_orb = 0.0
        
        # Rotation matrices to convert from orbital plane to ecliptic plane
        # 1. Rotate by omega around z-axis (argument of perihelion)
        cos_omega = np.cos(omega)
        sin_omega = np.sin(omega)
        x1 = cos_omega * x_orb - sin_omega * y_orb
        y1 = sin_omega * x_orb + cos_omega * y_orb
        z1 = z_orb
        vx1 = cos_omega * vx_orb - sin_omega * vy_orb
        vy1 = sin_omega * vx_orb + cos_omega * vy_orb
        vz1 = vz_orb
        
        # 2. Rotate by i around x-axis (inclination)
        cos_i = np.cos(i)
        sin_i = np.sin(i)
        x2 = x1
        y2 = cos_i * y1 - sin_i * z1
        z2 = sin_i * y1 + cos_i * z1
        vx2 = vx1
        vy2 = cos_i * vy1 - sin_i * vz1
        vz2 = sin_i * vy1 + cos_i * vz1
        
        # 3. Rotate by Omega around z-axis (longitude of ascending node)
        cos_Omega = np.cos(Omega)
        sin_Omega = np.sin(Omega)
        x = cos_Omega * x2 - sin_Omega * y2
        y = sin_Omega * x2 + cos_Omega * y2
        z = z2
        vx = cos_Omega * vx2 - sin_Omega * vy2
        vy = sin_Omega * vx2 + cos_Omega * vy2
        vz = vz2
        
        return np.array([x, y, z]), np.array([vx, vy, vz])
    
    @staticmethod
    def jd_from_datetime(dt):
        """Convert Python datetime to Julian Day."""
        a = (14 - dt.month) // 12
        y = dt.year + 4800 - a
        m = dt.month + 12 * a - 3
        jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
        jd = jdn + (dt.hour - 12) / 24 + dt.minute / 1440 + dt.second / 86400 + dt.microsecond / 86400000000
        return jd
    
    @staticmethod
    def datetime_from_jd(jd):
        """Convert Julian Day to Python datetime."""
        jd = jd + 0.5
        z = int(jd)
        f = jd - z
        
        if z < 2299161:
            a = z
        else:
            alpha = int((z - 1867216.25) / 36524.25)
            a = z + 1 + alpha - alpha // 4
        
        b = a + 1524
        c = int((b - 122.1) / 365.25)
        d = int(365.25 * c)
        e = int((b - d) / 30.6001)
        
        day = b - d - int(30.6001 * e)
        if e < 14:
            month = e - 1
        else:
            month = e - 13
        
        if month > 2:
            year = c - 4716
        else:
            year = c - 4715
        
        hour = int(f * 24)
        minute = int((f * 24 - hour) * 60)
        second = int(((f * 24 - hour) * 60 - minute) * 60)
        microsecond = int((((f * 24 - hour) * 60 - minute) * 60 - second) * 1000000)
        
        return datetime(year, month, day, hour, minute, second, microsecond)
