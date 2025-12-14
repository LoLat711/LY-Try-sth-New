import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import HandTracker from './components/HandTracker';
import Scene from './components/Scene';
import { HandData } from './types';

function App() {
  const [isExploded, setIsExploded] = useState(false);
  const [handData, setHandData] = useState<HandData | null>(null);

  const handleHandUpdate = useCallback((data: HandData | null) => {
    setHandData(data);
    // Optional: Trigger explosion with pinch gesture
    // We add a debounce logic roughly or just toggle logic check
    // keeping it simple: manual button is safer for UX, 
    // but let's just use hand for rotation as primary and button for explosion
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#111] text-white overflow-hidden font-sans">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas gl={{ antialias: true, toneMappingExposure: 1.5 }}>
          <Scene isExploded={isExploded} handData={handData} />
        </Canvas>
      </div>

      {/* Hand Tracker HUD */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* UI Overlay */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center shadow-2xl max-w-md mx-4 pointer-events-auto transition-all hover:bg-black/60">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-2">
            Cyber Christmas Tree
          </h1>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            Move your hand to rotate the tree.<br/>
            <span className="text-xs opacity-70">Powered by Three.js & MediaPipe</span>
          </p>
          
          <button
            onClick={() => setIsExploded(prev => !prev)}
            className={`
              px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300
              transform hover:scale-105 active:scale-95 shadow-lg
              ${isExploded 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
              }
            `}
          >
            {isExploded ? "RESTORE SHAPE" : "EXPLODE PARTICLES"}
          </button>
        </div>
      </div>

      {/* Connection Indicator */}
      <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 border ${handData ? 'border-green-500/50 bg-green-900/20 text-green-400' : 'border-red-500/50 bg-red-900/20 text-red-400'}`}>
        <div className={`w-2 h-2 rounded-full ${handData ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        {handData ? 'HAND DETECTED' : 'NO HAND'}
      </div>
      
    </div>
  );
}

export default App;