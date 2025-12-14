import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { ParticleData } from '../types';

// Fix: Extend JSX.IntrinsicElements with ThreeElements to resolve missing property errors for R3F components.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface TreeParticlesProps {
  data: ParticleData[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  isExploded: boolean;
  animationSpeed?: number;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ 
  data, 
  geometry, 
  material, 
  isExploded,
  animationSpeed = 2.0
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update logic
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const step = Math.min(delta * animationSpeed, 0.1); // Clamp step

    data.forEach((particle, i) => {
      // Interpolate position
      const target = isExploded ? particle.randomPosition : particle.treePosition;
      
      // We store the current visual position in a temporary way? 
      // Actually, standard lerping of matrices is hard. 
      // A common pattern is to re-construct the matrix from interpolated pos/rot/scale.
      
      // To keep state without React State overhead, we can read current matrix, 
      // decompose, lerp, compose.
      meshRef.current!.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Lerp Position
      dummy.position.lerp(target, step);

      // Rotation (Tree Mode: specific rotation, Exploded: tumbling)
      if (isExploded) {
        dummy.rotation.x += delta * 0.5;
        dummy.rotation.z += delta * 0.5;
      } else {
        // Lerp back to original rotation
        const targetRot = new THREE.Quaternion().setFromEuler(particle.rotation);
        dummy.quaternion.slerp(targetRot, step);
      }

      // Scale (Add a little pulse effect for lights maybe? Keep simple for now)
      const targetScaleScalar = isExploded ? particle.scale * 0.5 : particle.scale;
      const currentScaleScalar = dummy.scale.x; 
      const nextScale = THREE.MathUtils.lerp(currentScaleScalar, targetScaleScalar, step);
      dummy.scale.setScalar(nextScale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Initial Setup
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    data.forEach((particle, i) => {
      dummy.position.copy(particle.treePosition);
      dummy.rotation.copy(particle.rotation);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, particle.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data, dummy]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      frustumCulled={false}
    />
  );
};

export default TreeParticles;