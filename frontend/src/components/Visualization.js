import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Visualization.css';

const Visualization = ({ positions, selectedBody, onBodySelect }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshesRef = useRef({});
  const linesRef = useRef({});
  const cameraControlRef = useRef({
    distance: 50,
    angle: 0,
    elevation: 0.3,
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000511);
    scene.fog = new THREE.Fog(0x000511, 100, 500);

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400;
      positions[i + 1] = (Math.random() - 0.5) * 400;
      positions[i + 2] = (Math.random() - 0.5) * 400;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        cameraControlRef.current.angle += deltaX * 0.005;
        cameraControlRef.current.elevation += deltaY * 0.005;
        cameraControlRef.current.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraControlRef.current.elevation));
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      cameraControlRef.current.distance += e.deltaY * 0.05;
      cameraControlRef.current.distance = Math.max(5, Math.min(300, cameraControlRef.current.distance));
    });

    // Click detection for body selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const objectsToTest = Object.values(meshesRef.current);
      const intersects = raycaster.intersectObjects(objectsToTest);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        for (const [bodyId, mesh] of Object.entries(meshesRef.current)) {
          if (mesh === clickedMesh) {
            onBodySelect(bodyId);
            break;
          }
        }
      }
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update camera position
      const control = cameraControlRef.current;
      const x = control.distance * Math.cos(control.angle) * Math.cos(control.elevation);
      const y = control.distance * Math.sin(control.elevation);
      const z = control.distance * Math.sin(control.angle) * Math.cos(control.elevation);
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', null);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [onBodySelect]);

  // Update body positions
  useEffect(() => {
    if (!sceneRef.current || !positions.bodies) return;

    Object.entries(positions.bodies).forEach(([bodyId, body]) => {
      let mesh = meshesRef.current[bodyId];

      if (!mesh) {
        // Create new body mesh
        const scale = Math.max(0.3, Math.log(body.radius + 1) * 5);
        const geometry = new THREE.SphereGeometry(scale, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: body.color,
          emissive: body.type === 'star' ? body.color : 0x000000,
          emissiveIntensity: body.type === 'star' ? 1 : 0,
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { bodyId, ...body };
        sceneRef.current.add(mesh);
        meshesRef.current[bodyId] = mesh;

        // Add label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(body.name, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.userData.isLabel = true;
        label.position.y = scale + 0.5;
        mesh.add(label);
      }

      // Update position
      if (body.position) {
        mesh.position.set(body.position[0], body.position[1], body.position[2]);
      }

      // Highlight selected body
      if (bodyId === selectedBody) {
        mesh.material.emissiveIntensity = 0.5;
      } else {
        mesh.material.emissiveIntensity = body.type === 'star' ? 1 : 0;
      }
    });

    // Remove bodies that no longer exist
    Object.keys(meshesRef.current).forEach((bodyId) => {
      if (!positions.bodies[bodyId]) {
        const mesh = meshesRef.current[bodyId];
        sceneRef.current.remove(mesh);
        delete meshesRef.current[bodyId];
      }
    });
  }, [positions, selectedBody]);

  return <div ref={containerRef} className="visualization-container" />;
};

export default Visualization;
