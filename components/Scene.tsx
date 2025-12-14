import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateTreeParticles } from '../utils/treeLogic';
import TreeParticles from './TreeParticles';
import Star from './Star';
import { HandData } from '../types';

// Fix: Extend JSX.IntrinsicElements with ThreeElements to resolve missing property errors for R3F components.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  isExploded: boolean;
  handData: HandData | null;
}

const Scene: React.FC<SceneProps> = ({ isExploded, handData }) => {
  // Generate Data Once
  const { leaves, ornaments, lights } = useMemo(() => generateTreeParticles(), []);

  // Geometries
  const leafGeo = useMemo(() => new THREE.ConeGeometry(0.5, 1, 4), []); // Tetrahedron-ish
  const ornamentGeo = useMemo(() => new THREE.SphereGeometry(0.5, 16, 16), []);
  const lightGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.5), []);

  // Materials
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#003318',
    roughness: 0.8,
  }), []);

  const ornamentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', // Instanced color will override, but need base
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 1.5
  }), []);

  const lightMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity: 3,
    toneMapped: false
  }), []);

  // Group for rotation
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (handData) {
        // Map hand X (-1 to 1) to Rotation Y
        // Map hand Y (-1 to 1) to Rotation X (tilt)
        const targetRotY = handData.x * Math.PI; 
        const targetRotX = handData.y * 0.5;

        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3);
      } else {
        // Idle Auto Rotation
        groupRef.current.rotation.y += delta * 0.1;
        // Reset tilt
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      <Environment preset="city" background={false} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, 10]} intensity={0.5} />

      <group ref={groupRef}>
        <TreeParticles 
          data={leaves} 
          geometry={leafGeo} 
          material={leafMat} 
          isExploded={isExploded} 
        />
        <TreeParticles 
          data={ornaments} 
          geometry={ornamentGeo} 
          material={ornamentMat} 
          isExploded={isExploded} 
        />
        <TreeParticles 
          data={lights} 
          geometry={lightGeo} 
          material={lightMat} 
          isExploded={isExploded} 
        />
        <Star isExploded={isExploded} />
      </group>

      {/* OrbitControls as fallback/assistant, disable zoom to keep frame */}
      <OrbitControls enableZoom={false} enablePan={false} enabled={!handData} />
    </>
  );
};

export default Scene;