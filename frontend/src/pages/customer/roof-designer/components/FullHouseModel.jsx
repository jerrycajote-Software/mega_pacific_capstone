import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * FullHouseModel — Loads the unified 3D model containing the house and all roof layers.
 *
 * Toggles mesh visibility based on installation progress.
 * For installByPcs materials (Hermosa Roof Tile), only shows the first `tileQty`
 * tile meshes so the roof is revealed one piece at a time.
 * Applies `tileColor` to all tile meshes by cloning their material.
 */
const FullHouseModel = ({ houseLoaded, visibleIds, tileQty = 0, tileColor, ...props }) => {
  const { scene } = useGLTF('/models/model/Hermosa_Tile_build.glb');
  const ref = useRef();

  // Visibility effect — controls which meshes are shown
  useEffect(() => {
    if (!scene) return;

    const tileMeshes = [];
    scene.traverse((child) => {
      if (child.isMesh && child.name.startsWith('Hermosa_Tile_')) {
        tileMeshes.push(child);
      }
    });
    tileMeshes.sort((a, b) => a.name.localeCompare(b.name));

    const tileInstalled = visibleIds.has('hermosa_tile');

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const baseParts = [
        'Foundation', 'GroundFloor_Walls', 'SecondFloor_Walls',
        'Main_Door', 'Door_Canopy', 'Horizontal_Trim',
        'Window_GF_Left', 'Window_GF_Right', 'Window_SF_Left', 'Window_SF_Right',
        'Shutter_SF_L1', 'Shutter_SF_L2', 'Shutter_SF_R1', 'Shutter_SF_R2'
      ];

      let shouldShow = false;

      if (houseLoaded) {
        if (baseParts.includes(child.name)) {
          shouldShow = true;
        }
        else if (child.name === 'Top_Plate' && visibleIds.has('top_plate')) {
          shouldShow = true;
        }
        else if (['Roof_Truss_Front', 'Roof_Truss_Back', 'Gable_Wall_Left', 'Gable_Wall_Right'].includes(child.name) && visibleIds.has('roof_truss')) {
          shouldShow = true;
        }
        else if (['Fascia_Board_Front', 'Fascia_Board_Back'].includes(child.name) && visibleIds.has('fascia_board')) {
          shouldShow = true;
        }
        else if (['Roof_Decking_Front', 'Roof_Decking_Back'].includes(child.name) && visibleIds.has('roof_decking')) {
          shouldShow = true;
        }
        else if (['Eave_Flashing_Front', 'Eave_Flashing_Back'].includes(child.name) && visibleIds.has('eave_flashing')) {
          shouldShow = true;
        }
        else if (['Underlayment_Front', 'Underlayment_Back'].includes(child.name) && visibleIds.has('underlayment')) {
          shouldShow = true;
        }
        else if (['Battens_Front', 'Battens_Back'].includes(child.name) && visibleIds.has('purlins')) {
          shouldShow = true;
        }
        else if (child.name.startsWith('Hermosa_Tile_') && tileInstalled) {
          const tileIndex = tileMeshes.indexOf(child);
          shouldShow = tileIndex >= 0 && tileIndex < tileQty;
        }
        else if ((child.name.startsWith('Rake_Flashing_') || child.name === 'Ridge_Cap') && visibleIds.has('rake_valley_flashing')) {
          shouldShow = true;
        }
      }

      child.visible = shouldShow;
    });
  }, [scene, houseLoaded, visibleIds, tileQty]);

  // Color effect — applies tileColor to all Hermosa_Tile_ meshes
  useEffect(() => {
    if (!scene || !tileColor) return;

    const color = new THREE.Color(tileColor);

    scene.traverse((child) => {
      if (!child.isMesh || !child.name.startsWith('Hermosa_Tile_')) return;

      // Clone the original material once so we never mutate the shared GLB material
      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material;
      }
      const cloned = child.userData.originalMaterial.clone();
      cloned.color = color;
      child.material = cloned;
    });
  }, [scene, tileColor]);

  return (
    <primitive
      ref={ref}
      object={scene}
      {...props}
    />
  );
};

useGLTF.preload('/models/model/Hermosa_Tile_build.glb');

export default FullHouseModel;

