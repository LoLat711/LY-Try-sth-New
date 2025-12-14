import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData | null) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Use wrist (0) and middle finger tip (12) to determine rough position
        const wrist = landmarks[0];
        // Invert X because camera is mirrored
        const x = (1 - wrist.x) * 2 - 1; // Map 0..1 to -1..1
        const y = -(wrist.y * 2 - 1);    // Map 0..1 to 1..-1 (invert Y)

        // Simple pinch detection (Tip of thumb 4 and index 8 distance)
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2)
        );
        const isPinching = distance < 0.05;

        onHandUpdate({ x, y, isPinching });
      } else {
        onHandUpdate(null);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => setIsLoaded(true))
      .catch((err) => console.error("Camera start failed", err));

    return () => {
        // Cleanup if necessary, though Camera utils don't expose a clean stop method easily in this version
    };
  }, [onHandUpdate]);

  return (
    <div className="absolute top-4 left-4 z-50 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50 shadow-lg">
       {/* Hidden video actually processing, we can show it for feedback or hide it */}
       <video 
         ref={videoRef} 
         className="w-full h-full object-cover transform -scale-x-100" // Mirror for user convenience
         playsInline 
       />
       {!isLoaded && (
         <div className="absolute inset-0 flex items-center justify-center text-white text-xs text-center p-2">
           Loading Camera...
         </div>
       )}
    </div>
  );
};

export default HandTracker;