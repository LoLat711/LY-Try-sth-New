import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { createStarGeometry } from '../utils/treeLogic';

// Fix: Extend JSX.IntrinsicElements with ThreeElements to resolve missing property errors for R3F components.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface StarProps {
  isExploded: boolean;
}

const Star: React.FC<StarProps> = ({ isExploded }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => createStarGeometry(), []);
  
  // Center geometry
  useMemo(() => geometry.center(), [geometry]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Rotate constantly
    meshRef.current.rotation.y += delta;

    // Float movement
    const targetY = isExploded ? 25 : 9.5; // Top of tree is around 9 (height 18, center 0 -> -9 to 9) + a bit
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 2);
    
    // Scale pulse
    const scale = isExploded ? 0.1 : 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, delta * 2));
  });

  return (
    <mesh ref={meshRef} position={[0, 9.5, 0]} geometry={geometry}>
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700" 
        emissiveIntensity={1} 
        roughness={0.2} 
        metalness={1} 
      />
    </mesh>
  );
};

export default Star;