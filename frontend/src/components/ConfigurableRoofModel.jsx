import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Universal Configurable Roof Model Component
 * Supports both custom modular GLB exports (ex. Starter_House_6x6.glb)
 * and legacy models (ex. Hermosa_Tile_build.glb).
 *
 * Accurately displays installed sheet quantity (partial coverage),
 * allowing exposed rafters/purlins to show for uncovered areas.
 */
const ConfigurableRoofModel = ({
  modelPath = '/models/house/Starter_House_6x6.glb',
  sheetQty = 0,
  roofColorHex = '#3F4349',
  showSubstructure = true,
  showSheets = true,
  ...props
}) => {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  // Find and sort all sheet meshes
  const sheetMeshes = useMemo(() => {
    if (!scene) return [];
    const list = [];
    scene.traverse((child) => {
      if (child.isMesh && (child.name.startsWith('RoofSheet_') || child.name.startsWith('Hermosa_Tile_'))) {
        list.push(child);
      }
    });

    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    return list;
  }, [scene]);

  // Handle visibility based on sheet quantity & substructure flags
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const isSheet = child.name.startsWith('RoofSheet_') || child.name.startsWith('Hermosa_Tile_');
      const isSubstructure =
        child.name.startsWith('Truss_') ||
        child.name.startsWith('Purlin_') ||
        child.name.startsWith('Underlayment_') ||
        child.name.startsWith('Roof_Truss_') ||
        child.name.startsWith('Battens_') ||
        child.name.startsWith('Top_Plate');

      if (isSheet) {
        if (!showSheets) {
          child.visible = false;
        } else {
          const sheetIdx = sheetMeshes.indexOf(child);
          child.visible = sheetIdx >= 0 && sheetIdx < sheetQty;
        }
      } else if (isSubstructure) {
        child.visible = showSubstructure;
      } else {
        // Base house walls, foundation, doors, windows, trims remain visible
        child.visible = true;
      }
    });
  }, [scene, sheetMeshes, sheetQty, showSubstructure, showSheets]);

  // Apply real-time roof color to all sheet meshes
  useEffect(() => {
    if (!scene || !roofColorHex) return;

    const color = new THREE.Color(roofColorHex);

    scene.traverse((child) => {
      if (!child.isMesh) return;
      const isSheet = child.name.startsWith('RoofSheet_') || child.name.startsWith('Hermosa_Tile_');
      if (!isSheet) return;

      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material;
      }

      const cloned = child.userData.originalMaterial.clone();
      cloned.color = color;
      if (cloned.roughness !== undefined) cloned.roughness = 0.35;
      if (cloned.metalness !== undefined) cloned.metalness = 0.7;
      child.material = cloned;
    });
  }, [scene, roofColorHex]);

  return <primitive ref={modelRef} object={scene} {...props} />;
};

useGLTF.preload('/models/house/Pico_Rib_1220_House.glb');
useGLTF.preload('/models/house/Starter_House_6x6.glb');
useGLTF.preload('/models/model/Hermosa_Tile_build.glb');

export default ConfigurableRoofModel;
