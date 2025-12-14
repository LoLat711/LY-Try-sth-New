import * as THREE from 'three';
import { ParticleType, ParticleData } from '../types';

export const TOTAL_PARTICLES = 2500;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~2.3999 rad

export const generateTreeParticles = (): {
  leaves: ParticleData[];
  ornaments: ParticleData[];
  lights: ParticleData[];
} => {
  const leaves: ParticleData[] = [];
  const ornaments: ParticleData[] = [];
  const lights: ParticleData[] = [];

  const treeHeight = 18;
  const maxBaseRadius = 7;

  for (let i = 0; i < TOTAL_PARTICLES; i++) {
    const t = i / TOTAL_PARTICLES; // Normalized index 0 -> 1
    
    // Core Layout: Phyllotaxis Spiral
    const angle = i * GOLDEN_ANGLE;
    
    // Height Linear Distribution (Top to Bottom)
    // t goes 0->1. We want y to go from Top -> Bottom
    const y = (1 - t) * treeHeight - (treeHeight / 2); 
    
    // Base Radius: Cone shape (wider at bottom)
    const normalizedHeight = (y + treeHeight/2) / treeHeight; // 0 (bottom) to 1 (top)
    const currentBaseR = maxBaseRadius * (1 - normalizedHeight); 

    // Wave Layering
    // layerWave = Math.sin (t * 25.0) * 0.8 * (1 - t)
    const layerWave = Math.sin(t * 25.0) * 0.8 * (1 - t);

    // Determine Type
    const rand = Math.random();
    let type = ParticleType.LEAF;
    
    // Type Distribution: 70% A, 20% B, 10% C
    if (rand > 0.9) type = ParticleType.LIGHT; // 10%
    else if (rand > 0.7) type = ParticleType.ORNAMENT; // 20%
    else type = ParticleType.LEAF; // 70%

    // Type Specific Logic
    let radiusOffset = 0;
    let scale = 1;
    let color = new THREE.Color();
    let rotation = new THREE.Euler(0, 0, 0);

    if (type === ParticleType.LEAF) {
      // Type A: Leaves
      radiusOffset = Math.random() * 0.2; // 0.0 to 0.2
      scale = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
      color.set('#003318'); // Dark Green
      rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    } 
    else if (type === ParticleType.ORNAMENT) {
      // Type B: Ornaments
      radiusOffset = 0.4 + Math.random() * 0.2; // 0.4 to 0.6
      scale = 1.2 + Math.random() * 0.6; // 1.2 to 1.8
      // Gold or Deep Red
      color.set(Math.random() > 0.5 ? '#FFD700' : '#8a0a0a');
    } 
    else if (type === ParticleType.LIGHT) {
      // Type C: Lights
      radiusOffset = 0.25 + Math.random() * 0.2; // 0.25 to 0.45
      scale = 0.7; // Fixed
      // Cyan, Pink, Orange, White
      const lightColors = ['#00FFFF', '#FF00FF', '#FFA500', '#FFFFFF'];
      color.set(lightColors[Math.floor(Math.random() * lightColors.length)]);
    }

    // Final Coordinates
    // r = baseR + layerWave + radiusOffset
    const r = currentBaseR + layerWave + radiusOffset;
    
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);

    const treePos = new THREE.Vector3(x, y, z);
    
    // Random Position (Exploded state)
    // Sphere distribution roughly 30 units wide
    const rx = (Math.random() - 0.5) * 60;
    const ry = (Math.random() - 0.5) * 60;
    const rz = (Math.random() - 0.5) * 60;
    const randomPos = new THREE.Vector3(rx, ry, rz);

    const data: ParticleData = {
      id: i,
      type,
      treePosition: treePos,
      randomPosition: randomPos,
      scale,
      color,
      rotation
    };

    if (type === ParticleType.LEAF) leaves.push(data);
    else if (type === ParticleType.ORNAMENT) ornaments.push(data);
    else lights.push(data);
  }

  return { leaves, ornaments, lights };
};

export const createStarGeometry = (): THREE.ExtrudeGeometry => {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 1.2;
  const innerRadius = 0.5;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};