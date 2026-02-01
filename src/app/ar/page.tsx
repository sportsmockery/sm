'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare global {
  interface Window {
    WEBARROCKSFACE: any;
  }
}

export default function ARHelmetPage() {
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const helmetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;

    const init = async () => {
      const videoCanvas = videoCanvasRef.current;
      const threeCanvas = threeCanvasRef.current;
      if (!videoCanvas || !threeCanvas) return;

      // Set canvas dimensions
      const setCanvasDimensions = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // WebARRocksFace canvas (video background)
        videoCanvas.width = w;
        videoCanvas.height = h;

        // Three.js canvas (3D overlay)
        threeCanvas.width = w;
        threeCanvas.height = h;

        if (renderer) {
          renderer.setSize(w, h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        if (camera) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      };

      // 1) Load WebAR.rocks.face script
      if (!window.WEBARROCKSFACE) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = '/webarrocks/WebARRocksFace.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load WebARRocksFace'));
          document.head.appendChild(s);
        });
      }

      const WEBARROCKSFACE = window.WEBARROCKSFACE;
      if (!WEBARROCKSFACE) {
        console.error('WEBARROCKSFACE not available');
        return;
      }

      // 2) Setup Three.js with transparent background
      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false
      });
      renderer.setClearColor(0x000000, 0); // Fully transparent
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 3);

      // Better lighting for materials
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(0.5, 1, 2);
      scene.add(directionalLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
      backLight.position.set(-0.5, -1, -2);
      scene.add(backLight);

      // Set initial dimensions
      setCanvasDimensions();

      // 3) Load helmet model - NO wireframe, keep original materials
      const loader = new GLTFLoader();
      loader.load(
        '/models/sm_helmet_black.glb',
        (gltf) => {
          if (isDestroyed) return;

          const helmet = gltf.scene;
          helmetRef.current = helmet;

          // Traverse meshes - do NOT set wireframe
          helmet.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.frustumCulled = false;

              // Ensure materials render properly (NO wireframe)
              if (mesh.material) {
                const mat = mesh.material as THREE.Material;
                // Log material type for debugging
                console.log('Helmet material:', mat.type);
              }
            }
          });

          helmet.scale.set(0.8, 0.8, 0.8);
          helmet.visible = false; // Hide until face detected
          scene.add(helmet);
          console.log('Helmet loaded successfully');
        },
        (progress) => {
          console.log('Loading helmet:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
        },
        (err) => console.error('Helmet load error:', err)
      );

      // 4) Initialize WebARRocksFace with front camera
      WEBARROCKSFACE.init({
        canvas: videoCanvas,
        NNCPath: '/webarrocks/neuralNets/NN_FACE_2.json',
        videoSettings: {
          facingMode: 'user', // Front camera
          idealWidth: 1280,
          idealHeight: 720
        },
        callbackReady: (errCode: number) => {
          if (errCode) {
            console.error('WEBARROCKSFACE init error code:', errCode);
            return;
          }
          console.log('WebARRocksFace initialized successfully');
        },
        callbackTrack: (detectState: any) => {
          if (isDestroyed || !renderer) return;

          const helmet = helmetRef.current;

          if (helmet && detectState.detected > 0.5) {
            // Face detected - position helmet
            const x = detectState.x; // -1 to 1
            const y = detectState.y; // -1 to 1
            const s = detectState.s; // scale factor

            helmet.visible = true;

            // Position based on face location
            helmet.position.set(x * 2, y * 2.5 + 0.3, 0);

            // Apply face rotation
            helmet.rotation.set(
              detectState.rx,
              detectState.ry,
              detectState.rz
            );

            // Scale based on face size
            const baseScale = 1.2;
            helmet.scale.setScalar(baseScale * s);
          } else if (helmet) {
            helmet.visible = false;
          }

          // Render the 3D scene
          renderer.render(scene, camera);
        },
      });

      // Handle resize
      const handleResize = () => {
        setCanvasDimensions();
        // Tell WebARRocksFace to resize
        if (WEBARROCKSFACE.resize) {
          WEBARROCKSFACE.resize();
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
      });

      return () => {
        isDestroyed = true;
        window.removeEventListener('resize', handleResize);
        if (animationId) cancelAnimationFrame(animationId);
        try {
          WEBARROCKSFACE.destroy && WEBARROCKSFACE.destroy();
        } catch (e) {
          // ignore
        }
        renderer?.dispose();
      };
    };

    init();

    return () => {
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <main
      style={{
        backgroundColor: '#000',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* WebARRocksFace canvas - shows video background */}
      <canvas
        id="WebARRocksFaceCanvas"
        ref={videoCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)', // Mirror for selfie view
        }}
      />

      {/* Three.js canvas - 3D helmet overlay (transparent background) */}
      <canvas
        ref={threeCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)', // Mirror to match video
          pointerEvents: 'none',
        }}
      />

      {/* Loading indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: 14,
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          zIndex: 10,
        }}
      >
        SM Helmet AR v1
      </div>
    </main>
  );
}
