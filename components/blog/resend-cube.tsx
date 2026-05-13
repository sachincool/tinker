"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

interface ResendCubeProps {
  className?: string;
}

const RUBIK = {
  right: 0xc41e3a,   // red    (+X)
  left: 0xff5800,    // orange (-X)
  top: 0xffffff,     // white  (+Y)
  bottom: 0xffd500,  // yellow (-Y)
  front: 0x009e60,   // green  (+Z)
  back: 0x0051ba,    // blue   (-Z)
} as const;

type Axis = "x" | "y" | "z";
const FACES: { axis: Axis; value: number }[] = [
  { axis: "x", value: 1 },   // R
  { axis: "x", value: -1 },  // L
  { axis: "y", value: 1 },   // U
  { axis: "y", value: -1 },  // D
  { axis: "z", value: 1 },   // F
  { axis: "z", value: -1 },  // B
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ResendCube({ className = "" }: ResendCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: -0.55, y: -0.7 });
  const currentRotationRef = useRef({ x: -0.55, y: -0.7 });
  const dragMovedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    try {
      scene = new THREE.Scene();
      scene.background = null;
      sceneRef.current = scene;

      const initialWidth = container.clientWidth || 400;
      const initialHeight = container.clientHeight || 400;

      camera = new THREE.PerspectiveCamera(40, initialWidth / initialHeight, 0.1, 100);
      camera.position.set(0, 0, 10);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      if (!renderer.getContext()) return;

      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.style.touchAction = "none";

      renderer.setSize(initialWidth, initialHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (error) {
      console.error("Failed to initialize WebGL renderer:", error);
      return;
    }

    if (!scene || !camera || !renderer) return;

    function makeRubiksCube(): THREE.Group {
      const cubeletSize = 0.95;
      const spacing = 1.0;
      const stickerSize = 0.82;
      const stickerOffset = cubeletSize / 2 + 0.002;

      const group = new THREE.Group();

      const bodyGeom = new RoundedBoxGeometry(cubeletSize, cubeletSize, cubeletSize, 4, 0.1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.15,
        roughness: 0.6,
      });

      const stickerGeom = new THREE.PlaneGeometry(stickerSize, stickerSize);
      const makeStickerMat = (color: number) =>
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.0,
          roughness: 0.35,
          side: THREE.FrontSide,
        });

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          for (let k = -1; k <= 1; k++) {
            const cubelet = new THREE.Group();
            cubelet.position.set(i * spacing, j * spacing, k * spacing);

            const body = new THREE.Mesh(bodyGeom, bodyMat);
            cubelet.add(body);

            if (i === 1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.right));
              s.position.x = stickerOffset;
              s.rotation.y = Math.PI / 2;
              cubelet.add(s);
            }
            if (i === -1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.left));
              s.position.x = -stickerOffset;
              s.rotation.y = -Math.PI / 2;
              cubelet.add(s);
            }
            if (j === 1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.top));
              s.position.y = stickerOffset;
              s.rotation.x = -Math.PI / 2;
              cubelet.add(s);
            }
            if (j === -1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.bottom));
              s.position.y = -stickerOffset;
              s.rotation.x = Math.PI / 2;
              cubelet.add(s);
            }
            if (k === 1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.front));
              s.position.z = stickerOffset;
              cubelet.add(s);
            }
            if (k === -1) {
              const s = new THREE.Mesh(stickerGeom, makeStickerMat(RUBIK.back));
              s.position.z = -stickerOffset;
              s.rotation.y = Math.PI;
              cubelet.add(s);
            }

            group.add(cubelet);
          }
        }
      }

      return group;
    }

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 8, 9);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc7d8ff, 0.6);
    fillLight.position.set(-7, -3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd9b8, 0.45);
    rimLight.position.set(0, -4, -10);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const cube = makeRubiksCube();
    cube.rotation.x = currentRotationRef.current.x;
    cube.rotation.y = currentRotationRef.current.y;
    scene.add(cube);
    cubeRef.current = cube;

    // ---- Face-turn engine ----
    // Picks a random face every ~1s and animates a real 90° turn of those 9
    // cubelets. The turn is done by parking them in a temporary layer group,
    // rotating the layer, then re-parenting back to the cube while preserving
    // each cubelet's world transform — same algorithm a real Rubik's solver
    // visualisation uses.

    type TurnState = {
      layer: THREE.Group;
      cubelets: THREE.Object3D[];
      axis: Axis;
      targetAngle: number;
      startTime: number;
      duration: number;
    };

    let activeTurn: TurnState | null = null;
    let nextTurnAt = performance.now() + 600;
    let lastFaceKey = "";

    const startRandomTurn = () => {
      // Pick a face that isn't the same as the last one (avoids visual repetition)
      let face;
      let key;
      let attempts = 0;
      do {
        face = FACES[Math.floor(Math.random() * FACES.length)];
        key = `${face.axis}${face.value}`;
        attempts++;
      } while (key === lastFaceKey && attempts < 5);
      lastFaceKey = key;

      const direction = Math.random() < 0.5 ? 1 : -1;

      // Find the 9 cubelets on the chosen face by their LOCAL position in the
      // cube group (snap to nearest int to dodge floating-point drift).
      const layerCubelets: THREE.Object3D[] = [];
      cube.children.forEach((cubelet) => {
        const coord = Math.round(cubelet.position[face.axis]);
        if (coord === face.value) {
          layerCubelets.push(cubelet);
        }
      });

      if (layerCubelets.length !== 9) return; // safety

      const layer = new THREE.Group();
      cube.add(layer);
      layerCubelets.forEach((c) => layer.attach(c));

      activeTurn = {
        layer,
        cubelets: layerCubelets,
        axis: face.axis,
        targetAngle: (direction * Math.PI) / 2,
        startTime: performance.now(),
        duration: 480,
      };
    };

    const finishTurn = (turn: TurnState) => {
      // Bake the layer's rotation into each cubelet by re-parenting back to the
      // cube while preserving world transform.
      turn.cubelets.forEach((c) => cube.attach(c));
      cube.remove(turn.layer);

      // Snap cubelet positions back to grid so float drift can't accumulate
      // across hundreds of turns.
      turn.cubelets.forEach((c) => {
        c.position.x = Math.round(c.position.x);
        c.position.y = Math.round(c.position.y);
        c.position.z = Math.round(c.position.z);
      });

      activeTurn = null;
      nextTurnAt = performance.now() + 350 + Math.random() * 500;
    };

    const updateTurn = (now: number) => {
      if (!activeTurn) return;
      const t = Math.min((now - activeTurn.startTime) / activeTurn.duration, 1);
      const eased = easeInOutCubic(t);
      const angle = activeTurn.targetAngle * eased;

      activeTurn.layer.rotation.x = activeTurn.axis === "x" ? angle : 0;
      activeTurn.layer.rotation.y = activeTurn.axis === "y" ? angle : 0;
      activeTurn.layer.rotation.z = activeTurn.axis === "z" ? angle : 0;

      if (t >= 1) {
        finishTurn(activeTurn);
      }
    };

    // ---- Pointer interaction (drag the whole cube + click to scramble) ----
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();

      isDraggingRef.current = true;
      dragMovedRef.current = false;
      const clientX =
        "touches" in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

      previousMousePositionRef.current = { x: clientX, y: clientY };

      if (renderer.domElement) {
        renderer.domElement.style.cursor = "grabbing";
      }
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !cubeRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const clientX =
        "touches" in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
        dragMovedRef.current = true;
      }

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;

      targetRotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, targetRotationRef.current.x)
      );

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = (event?: MouseEvent | TouchEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Treat as a click if pointer barely moved — kick off an immediate turn.
      if (isDraggingRef.current && !dragMovedRef.current && !activeTurn) {
        nextTurnAt = performance.now();
      }

      isDraggingRef.current = false;
      dragMovedRef.current = false;
      if (renderer.domElement) {
        renderer.domElement.style.cursor = "grab";
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mouseleave", handlePointerUp);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
    canvas.addEventListener("touchcancel", handlePointerUp, { passive: false });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp, { passive: false });

    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      const now = performance.now();

      // Whole-cube gentle ambient rotation when the user isn't grabbing it.
      if (cubeRef.current) {
        if (!isDraggingRef.current) {
          targetRotationRef.current.y += 0.0035;
          targetRotationRef.current.x += 0.0007;
        }

        const lerpFactor = isDraggingRef.current ? 0.25 : 0.06;
        currentRotationRef.current.x +=
          (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
        currentRotationRef.current.y +=
          (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;

        cubeRef.current.rotation.x = currentRotationRef.current.x;
        cubeRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Fire the auto-scrambler. Pause new turns while the user is actively
      // dragging so they can examine the cube.
      if (activeTurn) {
        updateTurn(now);
      } else if (!isDraggingRef.current && now >= nextTurnAt) {
        startRandomTurn();
      }

      renderer!.render(scene!, camera!);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    resizeObserver.observe(container);

    animate();

    return () => {
      resizeObserver.disconnect();

      const c = renderer?.domElement;
      if (c) {
        c.removeEventListener("mousedown", handlePointerDown);
        c.removeEventListener("mouseleave", handlePointerUp);
        c.removeEventListener("touchstart", handlePointerDown);
        c.removeEventListener("touchcancel", handlePointerUp);
      }
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (container && renderer && renderer.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch {
          // Already detached
        }
      }

      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        userSelect: "none",
        WebkitUserSelect: "none",
        minHeight: "400px",
      }}
    />
  );
}
