"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

interface ResendCubeProps {
  className?: string;
}

export default function ResendCube({ className = "" }: ResendCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const cubeRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.3, y: 0.5 });
  const currentRotationRef = useRef({ x: 0.3, y: 0.5 });
  const targetZoomRef = useRef(8);
  const currentZoomRef = useRef(8);

  useEffect(() => {
    if (!containerRef.current) return;

    // Error handling for WebGL context - declare variables outside try block for cleanup
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let composer: EffectComposer | null = null;

    try {
      // Create scene
      scene = new THREE.Scene();
      // No background color - use transparent so it blends with page
      scene.background = null;
      sceneRef.current = scene;

      // Create camera
      camera = new THREE.PerspectiveCamera(
        50,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 8;
      cameraRef.current = camera;

      // Create renderer with error handling
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance",
      });
      
      // Check if WebGL is supported
      if (!renderer.getContext()) {
        console.warn("WebGL not supported, ResendCube will not render");
        return;
      }

      // Ensure container has dimensions, fallback to window size
      let width = containerRef.current.clientWidth;
      let height = containerRef.current.clientHeight;
      
      // If container has no dimensions, wait a bit and try again, or use parent dimensions
      if (!width || !height) {
        // Try to get parent section dimensions
        const parent = containerRef.current.parentElement;
        if (parent) {
          width = parent.clientWidth || window.innerWidth;
          height = parent.clientHeight || window.innerHeight;
        } else {
          width = window.innerWidth;
          height = window.innerHeight;
        }
      }
      
      console.log("ResendCube: Initializing with dimensions", { 
        width, 
        height, 
        containerWidth: containerRef.current.clientWidth, 
        containerHeight: containerRef.current.clientHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
      
      // Ensure canvas fills container and receives pointer events
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.style.touchAction = "none"; // Prevent scrolling on touch
      
      console.log("ResendCube: Canvas element created", {
        canvasWidth: renderer.domElement.width,
        canvasHeight: renderer.domElement.height,
        canvasStyle: renderer.domElement.style.cssText
      });
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      console.log("ResendCube: Renderer created and canvas appended");
    } catch (error) {
      console.error("Failed to initialize WebGL renderer:", error);
      return;
    }

    if (!scene || !camera || !renderer) return;

    // Function to create rounded edges cube
    function createBoxWithRoundedEdges(
      width: number,
      height: number,
      depth: number,
      radius0: number,
      smoothness: number
    ): THREE.BufferGeometry {
      const shape = new THREE.Shape();
      const eps = 0.00001;
      const radius = radius0 - eps;

      shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
      shape.absarc(
        eps,
        height - radius * 2,
        eps,
        Math.PI,
        Math.PI / 2,
        true
      );
      shape.absarc(
        width - radius * 2,
        height - radius * 2,
        eps,
        Math.PI / 2,
        0,
        true
      );
      shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness,
      });

      geometry.center();

      return geometry;
    }

    // Function to create 27 cubes with individual references
    function makeCubes(): { group: THREE.Group; layers: THREE.Group[] } {
      const numCubes = 3;
      const cubes = new THREE.Group();
      const cubeSize = 1.1;
      const layers: THREE.Group[] = [];

      // Create 3 layers (top, middle, bottom) - each can rotate independently
      for (let j = -Math.floor(numCubes / 2); j <= Math.floor(numCubes / 2); j++) {
        const layer = new THREE.Group();
        
        for (let i = -Math.floor(numCubes / 2); i <= Math.floor(numCubes / 2); i++) {
          for (
            let k = -Math.floor(numCubes / 2);
            k <= Math.floor(numCubes / 2);
            k++
          ) {
            // Vary material slightly for depth and visual interest
            const intensity = 0.7 + (Math.abs(i) + Math.abs(j) + Math.abs(k)) * 0.05;
            const isEdge = Math.abs(i) === 1 || Math.abs(j) === 1 || Math.abs(k) === 1;
            
            const material = new THREE.MeshStandardMaterial({
              color: isEdge ? 0x5a5a5a : 0x6a6a6a,
              metalness: 0.3,
              roughness: 0.5,
              emissive: 0x1a1a2e,
              emissiveIntensity: isEdge ? 0.2 * intensity : 0.15 * intensity,
            });
            
            const geom = createBoxWithRoundedEdges(cubeSize, cubeSize, cubeSize, 0.17, 20);
            geom.translate(i * cubeSize, j * cubeSize, k * cubeSize);
            const cube = new THREE.Mesh(geom, material);
            layer.add(cube);
          }
        }
        
        layers.push(layer);
        cubes.add(layer);
      }

      return { group: cubes, layers };
    }

    // Enhanced lighting setup
    const mainLight = new THREE.PointLight(0xffffff, 150, 600);
    mainLight.position.set(0, 5, 12);
    mainLight.castShadow = false;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffffff, 30, 500);
    fillLight.position.set(0, -10, -5);
    fillLight.castShadow = false;
    scene.add(fillLight);

    // Colored accent lights for vibrant feel
    const accentLight1 = new THREE.PointLight(0x60a5fa, 45, 450);
    accentLight1.position.set(10, 5, 5);
    accentLight1.castShadow = false;
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xc084fc, 35, 450);
    accentLight2.position.set(-10, -5, 5);
    accentLight2.castShadow = false;
    scene.add(accentLight2);

    const accentLight3 = new THREE.PointLight(0xf472b6, 25, 400);
    accentLight3.position.set(-5, 10, -5);
    accentLight3.castShadow = false;
    scene.add(accentLight3);

    // Volumetric light for dramatic effect
    const volumetricLight = new THREE.PointLight(0xffffff, 60, 650);
    volumetricLight.position.set(0, 0, 15);
    volumetricLight.castShadow = false;
    scene.add(volumetricLight);

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // Subtle fog for depth perception
    scene.fog = new THREE.Fog(0x000000, 10, 40);

    // Create cube group with separate layers
    const cubeData = makeCubes();
    const cube = cubeData.group;
    const layers = cubeData.layers;
    scene.add(cube);
    cubeRef.current = cube;
    
    // Initialize rotation state
    targetRotationRef.current = { x: 0, y: 0 };
    currentRotationRef.current = { x: 0, y: 0 };

    // Post-processing setup (Part 2: Bloom)
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      ),
      1.8, // strength - more pronounced glow
      0.5, // radius - wider spread
      0.82 // threshold - slightly lower for more bloom
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Mouse/touch interaction handlers
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      isDraggingRef.current = true;
      const clientX =
        "touches" in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
      
      previousMousePositionRef.current = {
        x: clientX,
        y: clientY,
      };
      
      if (renderer.domElement) {
        renderer.domElement.style.cursor = "grabbing";
      }
      
      console.log("ResendCube: Drag started", { clientX, clientY });
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

      // Smooth drag sensitivity
      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;

      // Clamp X rotation to prevent flipping
      targetRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationRef.current.x));

      previousMousePositionRef.current = {
        x: clientX,
        y: clientY,
      };
    };

    const handlePointerUp = (event?: MouseEvent | TouchEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      isDraggingRef.current = false;
      if (renderer.domElement) {
        renderer.domElement.style.cursor = "grab";
      }
      
      console.log("ResendCube: Drag ended");
    };

    // Add mouse and touch event listeners to canvas
    const canvas = renderer.domElement;
    if (canvas) {
      // Mouse events
      canvas.addEventListener("mousedown", handlePointerDown);
      canvas.addEventListener("mouseleave", handlePointerUp);
      
      // Touch events
      canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
      canvas.addEventListener("touchcancel", handlePointerUp, { passive: false });
      
      // Global move/up events
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("touchend", handlePointerUp, { passive: false });
      
      console.log("ResendCube: Event listeners attached");
    }

    // Animation loop with enhanced lighting and smooth transitions
    let time = 0;
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      if (cubeRef.current) {
        if (!isDraggingRef.current) {
          // Gentle auto-rotation when idle
          const autoRotateSpeed = 0.003;
          targetRotationRef.current.x += autoRotateSpeed * 0.5;
          targetRotationRef.current.y += autoRotateSpeed;
        }

        // Smooth interpolation for rotation
        const lerpFactor = isDraggingRef.current ? 0.2 : 0.08;
        currentRotationRef.current.x +=
          (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
        currentRotationRef.current.y +=
          (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;

        cubeRef.current.rotation.x = currentRotationRef.current.x;
        cubeRef.current.rotation.y = currentRotationRef.current.y;
        
        // Rotate individual layers for dynamic effect (like Resend cube)
        if (layers && layers.length === 3) {
          layers[0].rotation.y = time * 0.2; // Top layer
          layers[1].rotation.y = -time * 0.15; // Middle layer (opposite direction)
          layers[2].rotation.y = time * 0.25; // Bottom layer
        }
      }

      // Animated volumetric lighting for dramatic effect
      if (volumetricLight) {
        volumetricLight.position.x = Math.sin(time * 0.4) * 4;
        volumetricLight.position.y = Math.cos(time * 0.3) * 3;
        volumetricLight.intensity = 60 + Math.sin(time * 1.2) * 15;
      }

      // Pulse accent lights for vibrant atmosphere
      if (accentLight1) {
        accentLight1.intensity = 45 + Math.sin(time * 0.6) * 8;
        accentLight1.position.x = 10 + Math.sin(time * 0.3) * 2;
      }
      if (accentLight2) {
        accentLight2.intensity = 35 + Math.cos(time * 0.7) * 6;
        accentLight2.position.y = -5 + Math.cos(time * 0.4) * 2;
      }
      if (accentLight3) {
        accentLight3.intensity = 25 + Math.sin(time * 0.8) * 5;
      }

      composer.render();
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (composer) {
        composer.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      // Remove mouse and touch event listeners
      const canvas = renderer?.domElement;
      if (canvas) {
        canvas.removeEventListener("mousedown", handlePointerDown);
        canvas.removeEventListener("mouseleave", handlePointerUp);
        canvas.removeEventListener("touchstart", handlePointerDown);
        canvas.removeEventListener("touchcancel", handlePointerUp);
      }
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (containerRef.current && renderer && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Element may have already been removed
        }
      }

      // Dispose of geometries and materials
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

      // Dispose of post-processing
      if (composer) {
        composer.dispose();
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
        minHeight: "400px"
      }}
    />
  );
}

