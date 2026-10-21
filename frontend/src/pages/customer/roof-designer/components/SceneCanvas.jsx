import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { CircularProgress } from '@mui/material';
import FullHouseModel from './FullHouseModel';

/**
 * Inline loading spinner displayed while 3D models are loading.
 */
const Loader = () => (
  <Html center>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      color: '#64748b',
    }}>
      <CircularProgress size={36} sx={{ color: '#4f772d' }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Loading 3D models…</span>
    </div>
  </Html>
);

/**
 * The main Three.js canvas component for the Roof Designer.
 *
 * Loads the unified FullHouseModel and passes the visibility state.
 *
 * @param {boolean} houseLoaded - Whether the house base model should be shown
 * @param {Set} visibleIds - Set of installed material IDs to show in the scene
 */
const SceneCanvas = ({ houseLoaded = false, visibleIds = new Set(), tileQty = 0, tileColor }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 8], fov: 45, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #e8f0fe 0%, #d1dce8 100%)' }}
      gl={{ antialias: true, alpha: false }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} />

      <Environment preset="city" />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={10}
      />

      <gridHelper args={[20, 20, '#c8d6e5', '#e2e8f0']} position={[0, 0, 0]} />

      {/* 3D Models — single unified file controls its own visibility */}
      <Suspense fallback={<Loader />}>
        <FullHouseModel 
          position={[0, 0, 0]} 
          houseLoaded={houseLoaded} 
          visibleIds={visibleIds}
          tileQty={tileQty}
          tileColor={tileColor}
        />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 2, 0]}
      />
    </Canvas>
  );
};

export default SceneCanvas;
