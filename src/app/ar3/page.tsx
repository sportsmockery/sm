'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare global {
  interface Window {
    WEBARROCKSFACE: any;
  }
}

export default function AR3HelmetPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let threeRenderer: THREE.WebGLRenderer | null = null;
    let threeScene: THREE.Scene | null = null;
    let threeCamera: THREE.PerspectiveCamera | null = null;
    let helmetGroup: THREE.Group | null = null;
    let gltfHelmet: THREE.Object3D | null = null;
    let isDestroyed = false;
    let mediaStream: MediaStream | null = null;

    const init = async () => {
      const video = videoRef.current;
      const webarCanvas = webarCanvasRef.current;
      const threeCanvas = threeCanvasRef.current;
      if (!video || !webarCanvas || !threeCanvas) return;

      // Step 1: Get camera stream FIRST and display it
      setStatus('Requesting camera access...');
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        video.srcObject = mediaStream;
        await video.play();
        console.log('Camera stream started');
      } catch (err) {
        console.error('Camera access error:', err);
        setStatus('Camera access denied');
        return;
      }

      // Step 2: Load WebAR.rocks.face script
      setStatus('Loading face tracking...');
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
        setStatus('Face tracking failed to load');
        return;
      }

      // Set canvas sizes
      webarCanvas.width = 640;
      webarCanvas.height = 480;
      threeCanvas.width = window.innerWidth;
      threeCanvas.height = window.innerHeight;

      // Initialize Three.js
      const initThree = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        threeRenderer = new THREE.WebGLRenderer({
          canvas: threeCanvas,
          alpha: true,
          antialias: true
        });
        threeRenderer.setSize(w, h);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeRenderer.setClearColor(0x000000, 0); // Transparent

        threeScene = new THREE.Scene();

        threeCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
        threeCamera.position.set(0, 0, 5);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        threeScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(0.5, 1, 2);
        threeScene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(-0.5, -1, -2);
        threeScene.add(backLight);

        // Create helmet group
        helmetGroup = new THREE.Group();
        threeScene.add(helmetGroup);

        // Load helmet model
        const loader = new GLTFLoader();
        loader.load(
          '/ar/SM_v8.glb',
          (gltf) => {
            if (isDestroyed) return;

            gltfHelmet = gltf.scene;

            // Ensure the front (logo side) faces the camera
            gltfHelmet.rotation.set(0, Math.PI, 0);

            // Nudge whole helmet slightly toward camera
            gltfHelmet.position.set(0, 0, 0.25);

            // If the logo is a separate mesh, make sure it's visible
            gltfHelmet.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.frustumCulled = false;   // prevent clipping of logo
                mesh.visible = true;
                if (mesh.name.toLowerCase().includes('logo')) {
                  mesh.renderOrder = 2;       // draw on top if needed
                }
                // Ensure textures render properly
                if (mesh.material) {
                  (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
                  (mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
                }
              }
            });

            gltfHelmet.scale.setScalar(1.0);
            helmetGroup!.add(gltfHelmet);

            console.log('Helmet loaded successfully');
            setStatus('Face tracking ready');
          },
          (progress) => {
            const pct = (progress.loaded / progress.total * 100).toFixed(0);
            setStatus(`Loading helmet: ${pct}%`);
          },
          (err) => {
            console.error('Helmet load error:', err);
            setStatus('Failed to load helmet');
          }
        );
      };

      // WebAR.rocks callbacks
      const callbackReady = (errCode: number) => {
        if (errCode) {
          console.error('WEBARROCKSFACE init error:', errCode);
          setStatus('Face tracking error');
          return;
        }
        console.log('WebARRocksFace initialized');
        initThree();
      };

      const callbackTrack = (detectState: any) => {
        if (isDestroyed || !helmetGroup || !gltfHelmet || !threeRenderer || !threeScene || !threeCamera) return;

        if (!detectState.detected || detectState.detected < 0.5) {
          helmetGroup.visible = false;
          threeRenderer.render(threeScene, threeCamera);
          return;
        }

        helmetGroup.visible = true;

        const s = detectState.s;
        const x = detectState.x;
        const y = detectState.y;
        const rx = detectState.rx;
        const ry = detectState.ry;
        const rz = detectState.rz;

        // Tuning - get helmet onto head properly
        const Z = 4.6;          // bring helmet closer to face
        const yOffset = 0.3;    // raise helmet up on head
        const baseScale = 0.52; // slightly larger so it wraps the skull

        helmetGroup.position.set(
          x * Z,
          y * Z + yOffset,
          -Z
        );

        // Selfie mirroring via rotation only (no scale.x flip to preserve logo)
        helmetGroup.rotation.set(rx, -ry, rz);

        // No negative scale - keeps logo readable
        helmetGroup.scale.setScalar(baseScale * s);

        threeRenderer.render(threeScene, threeCamera);
      };

      // Initialize WebAR.rocks with video element
      setStatus('Initializing face tracking...');

      WEBARROCKSFACE.init({
        canvas: webarCanvas,
        videoElement: video,  // Use existing video element with stream
        NNCPath: '/webarrocks/neuralNets/NN_FACE_2.json',
        callbackReady,
        callbackTrack
      });

      // Handle resize
      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        webarCanvas.width = w;
        webarCanvas.height = h;
        threeCanvas.width = w;
        threeCanvas.height = h;

        if (threeRenderer && threeCamera) {
          threeRenderer.setSize(w, h);
          threeCamera.aspect = w / h;
          threeCamera.updateProjectionMatrix();
        }

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
        try {
          WEBARROCKSFACE.destroy && WEBARROCKSFACE.destroy();
        } catch (e) {
          // ignore
        }
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        threeRenderer?.dispose();
      };
    };

    init();

    return () => {
      if (threeRenderer) threeRenderer.dispose();
    };
  }, []);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      {/* Video element - camera feed background */}
      <video
        ref={videoRef}
        id="video"
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          transform: 'scaleX(-1)', // Mirror for selfie
        }}
      />

      {/* WebAR.rocks canvas - hidden, just for face detection */}
      <canvas
        ref={webarCanvasRef}
        id="webar-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Three.js canvas - 3D helmet overlay (no CSS mirror - handled in 3D) */}
      <canvas
        ref={threeCanvasRef}
        id="three-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Status indicator */}
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
        {status}
      </div>
    </main>
  );
}
