import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DEFAULT_LAYER_VISIBILITY,
  getLayerIdForMesh,
  getExplodeOffsetForMesh,
} from '../constants/roofStructureSpecs';

const BASE_MESH_THICKNESS = 0.0035;

const parseThicknessMm = (thicknessStr) => {
  if (!thicknessStr) return 0.35;
  const num = parseFloat(String(thicknessStr).replace(/[^0-9.]/g, ''));
  return !isNaN(num) && num > 0 ? num : 0.35;
};

/**
 * Universal Configurable Roof Model Component
 * Supports both custom modular GLB exports (ex. Pico_Rib_1220_House.glb, Starter_House_6x6.glb)
 * and legacy models (ex. Hermosa_Tile_build.glb).
 *
 * Powers interactive 3D Internal Roof Structure Visualization:
 * - Individual structural layer visibility & isolation
 * - Real-time vertical exploded assembly interpolation
 * - X-Ray translucent roof & underlayment mode
 * - Direct 3D raycast click & hover part inspection
 * - Real-time steel sheet gauge thickness scaling
 */
const ConfigurableRoofModel = ({
  modelPath = '/models/house/Starter_House_6x6.glb',
  sheetQty = 0,
  roofColorHex = '#3F4349',
  thickness = '0.35mm',
  showSubstructure = true,
  showSheets = true,
  layerVisibility = DEFAULT_LAYER_VISIBILITY,
  explodeFactor = 0,
  xraySheets = false,
  selectedMeshName = null,
  onSelectMesh,
  ...props
}) => {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();
  const [hoveredMeshName, setHoveredMeshName] = useState(null);

  // Cache initial resting Y position for each mesh for smooth exploded view animation
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.userData.restingY === undefined) {
        child.userData.restingY = child.position.y;
      }
    });
  }, [scene]);

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

  // Handle visibility based on sheet quantity, substructure flags, and granular 7-layer visibility
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const layerId = getLayerIdForMesh(child.name);
      const isLayerEnabled = layerVisibility?.[layerId] !== false;

      if (layerId === 'roof_sheets') {
        if (!showSheets || !isLayerEnabled) {
          child.visible = false;
        } else {
          const sheetIdx = sheetMeshes.indexOf(child);
          child.visible = sheetIdx >= 0 && sheetIdx < sheetQty;
        }
      } else if (
        layerId === 'underlayment' ||
        layerId === 'purlins' ||
        layerId === 'trusses' ||
        layerId === 'top_plate'
      ) {
        child.visible = Boolean(showSubstructure && isLayerEnabled);
      } else {
        child.visible = Boolean(isLayerEnabled);
      }
    });
  }, [scene, sheetMeshes, sheetQty, showSubstructure, showSheets, layerVisibility]);

  // Apply real-time roof color, X-Ray translucency, and hover/selection highlights
  useEffect(() => {
    if (!scene) return;

    const roofColor = new THREE.Color(roofColorHex || '#3F4349');
    const selectedEmissive = new THREE.Color('#22c55e');
    const hoveredEmissive = new THREE.Color('#38bdf8');
    const zeroEmissive = new THREE.Color('#000000');

    scene.traverse((child) => {
      if (!child.isMesh) return;

      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material;
      }

      const cloned = child.userData.originalMaterial.clone();
      const layerId = getLayerIdForMesh(child.name);

      if (layerId === 'roof_sheets') {
        cloned.color = roofColor;
        if (cloned.roughness !== undefined) cloned.roughness = 0.35;
        if (cloned.metalness !== undefined) cloned.metalness = 0.7;
      }

      if (xraySheets && (layerId === 'roof_sheets' || layerId === 'underlayment')) {
        cloned.transparent = true;
        cloned.opacity = layerId === 'roof_sheets' ? 0.24 : 0.18;
        cloned.depthWrite = false;
      } else {
        cloned.transparent = Boolean(child.userData.originalMaterial.transparent);
        cloned.opacity = child.userData.originalMaterial.opacity ?? 1.0;
        cloned.depthWrite = true;
      }

      if (cloned.emissive !== undefined) {
        if (selectedMeshName && child.name === selectedMeshName) {
          cloned.emissive = selectedEmissive;
          cloned.emissiveIntensity = 0.42;
        } else if (hoveredMeshName && child.name === hoveredMeshName) {
          cloned.emissive = hoveredEmissive;
          cloned.emissiveIntensity = 0.25;
        } else {
          cloned.emissive = zeroEmissive;
          cloned.emissiveIntensity = 0.0;
        }
      }

      child.material = cloned;
    });
  }, [scene, roofColorHex, xraySheets, selectedMeshName, hoveredMeshName]);

  // Smoothly interpolate vertical exploded assembly offsets in 3D space
  useFrame((_, delta) => {
    if (!scene) return;
    const clampedFactor = Math.max(0, Math.min(1, Number(explodeFactor) || 0));
    const lerpSpeed = Math.min(1, delta * 10);

    scene.traverse((child) => {
      if (!child.isMesh || child.userData.restingY === undefined) return;
      const offset = getExplodeOffsetForMesh(child.name) * clampedFactor;
      const targetY = child.userData.restingY + offset;
      if (Math.abs(child.position.y - targetY) > 0.0005) {
        child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, lerpSpeed);
      } else {
        child.position.y = targetY;
      }
    });
  });

  // Apply real-time steel sheet thickness scaling to the underside shell vertices
  // while keeping the top 28mm rib profile crest locked at its exact height.
  useEffect(() => {
    if (!scene) return;

    const targetThicknessMm = parseThicknessMm(thickness);
    const thicknessRatio = targetThicknessMm / 0.35;
    const targetShellThickness = BASE_MESH_THICKNESS * thicknessRatio;
    const deltaOffset = BASE_MESH_THICKNESS - targetShellThickness;

    scene.traverse((child) => {
      if (!child.isMesh || !child.name.startsWith('RoofSheet_')) return;
      const geom = child.geometry;
      if (!geom || !geom.attributes?.position) return;

      const posAttr = geom.attributes.position;
      const count = posAttr.count;
      const isCurvedSheet =
        Boolean(child.userData?.is_curved_roof) ||
        typeof child.userData?.arch_center_y === 'number';
      const archCenterY = Number(child.userData?.arch_center_y) || 0;

      if (!child.userData.basePositions) {
        const baseArr = new Float32Array(posAttr.array.length);
        baseArr.set(posAttr.array);
        child.userData.basePositions = baseArr;

        const isBottomVertex = new Uint8Array(count);

        if (isCurvedSheet) {
          // Group vertices along radial rays (x, archAngle) and mark the inner radial shell
          const maxRByAngle = new Map();
          const radialNorms = new Float32Array(count * 2);

          for (let i = 0; i < count; i++) {
            const xVal = baseArr[i * 3];
            const dy = baseArr[i * 3 + 1] - archCenterY;
            const zVal = baseArr[i * 3 + 2];
            const rVal = Math.hypot(dy, zVal) || 1e-6;
            radialNorms[i * 2] = dy / rVal;
            radialNorms[i * 2 + 1] = zVal / rVal;

            const xKey = Math.round(xVal * 10000);
            const angKey = Math.round(Math.atan2(zVal, dy) * 10000);
            const key = `${xKey}_${angKey}`;
            const prevMax = maxRByAngle.get(key);
            if (prevMax === undefined || rVal > prevMax) {
              maxRByAngle.set(key, rVal);
            }
          }

          for (let i = 0; i < count; i++) {
            const xVal = baseArr[i * 3];
            const dy = baseArr[i * 3 + 1] - archCenterY;
            const zVal = baseArr[i * 3 + 2];
            const rVal = Math.hypot(dy, zVal);
            const xKey = Math.round(xVal * 10000);
            const angKey = Math.round(Math.atan2(zVal, dy) * 10000);
            const topR = maxRByAngle.get(`${xKey}_${angKey}`);
            if (topR !== undefined && topR - rVal > 0.001) {
              isBottomVertex[i] = 1;
            }
          }
          child.userData.radialNorms = radialNorms;
        } else {
          // Flat sloped sheet: group vertices sharing (x, z) and mark lower y vertex
          const maxYByXZ = new Map();
          for (let i = 0; i < count; i++) {
            const xKey = Math.round(baseArr[i * 3] * 10000);
            const zKey = Math.round(baseArr[i * 3 + 2] * 10000);
            const key = `${xKey}_${zKey}`;
            const yVal = baseArr[i * 3 + 1];
            const prevMax = maxYByXZ.get(key);
            if (prevMax === undefined || yVal > prevMax) {
              maxYByXZ.set(key, yVal);
            }
          }

          for (let i = 0; i < count; i++) {
            const xKey = Math.round(baseArr[i * 3] * 10000);
            const zKey = Math.round(baseArr[i * 3 + 2] * 10000);
            const key = `${xKey}_${zKey}`;
            const topY = maxYByXZ.get(key);
            const yVal = baseArr[i * 3 + 1];
            if (topY !== undefined && topY - yVal > 0.001) {
              isBottomVertex[i] = 1;
            }
          }
        }
        child.userData.isBottomVertex = isBottomVertex;
      }

      const baseArr = child.userData.basePositions;
      const isBottomVertex = child.userData.isBottomVertex;
      const radialNorms = child.userData.radialNorms;
      const liveArr = posAttr.array;

      for (let i = 0; i < count; i++) {
        const yIdx = i * 3 + 1;
        const zIdx = i * 3 + 2;
        if (isBottomVertex[i]) {
          if (isCurvedSheet && radialNorms) {
            liveArr[yIdx] = baseArr[yIdx] + radialNorms[i * 2] * deltaOffset;
            liveArr[zIdx] = baseArr[zIdx] + radialNorms[i * 2 + 1] * deltaOffset;
          } else {
            liveArr[yIdx] = baseArr[yIdx] + deltaOffset;
          }
        } else {
          liveArr[yIdx] = baseArr[yIdx];
          liveArr[zIdx] = baseArr[zIdx];
        }
      }

      posAttr.needsUpdate = true;
      geom.computeBoundingBox();
      geom.computeBoundingSphere();
    });
  }, [scene, thickness]);

  const { camera, gl } = useThree();

  useEffect(() => {
    const domElement = gl?.domElement;
    if (!domElement || !scene) return;

    let pointerDownPos = null;
    let pointerDownTime = 0;

    const handlePointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    };

    const handlePointerUp = (e) => {
      if (!pointerDownPos) return;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      const elapsed = Date.now() - pointerDownTime;
      pointerDownPos = null;

      if (dx < 8 && dy < 8 && elapsed < 600) {
        const rect = domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const clickRaycaster = new THREE.Raycaster();
        clickRaycaster.setFromCamera(mouse, camera);

        const intersects = clickRaycaster.intersectObjects(scene.children, true);
        const hit = intersects.find((item) => item.object?.isMesh && item.object.visible);

        if (hit && hit.object && onSelectMesh) {
          onSelectMesh(hit.object.name);
        }
      }
    };

    const handlePointerMove = (e) => {
      const rect = domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const hoverRaycaster = new THREE.Raycaster();
      hoverRaycaster.setFromCamera(mouse, camera);

      const intersects = hoverRaycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((item) => item.object?.isMesh && item.object.visible);

      if (hit && hit.object) {
        domElement.style.cursor = 'pointer';
        setHoveredMeshName(hit.object.name);
      } else {
        domElement.style.cursor = 'default';
        setHoveredMeshName(null);
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('pointermove', handlePointerMove);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('pointermove', handlePointerMove);
      if (domElement) {
        domElement.style.cursor = 'default';
      }
    };
  }, [gl, scene, camera, onSelectMesh]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      {...props}
    />
  );
};

export default ConfigurableRoofModel;
