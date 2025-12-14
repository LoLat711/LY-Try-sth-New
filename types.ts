import * as THREE from 'three';

export enum ParticleType {
  LEAF = 'LEAF',
  ORNAMENT = 'ORNAMENT',
  LIGHT = 'LIGHT'
}

export interface ParticleData {
  id: number;
  type: ParticleType;
  treePosition: THREE.Vector3;
  randomPosition: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  rotation: THREE.Euler;
}

export interface HandData {
  x: number; // -1 to 1
  y: number; // -1 to 1
  isPinching: boolean;
}