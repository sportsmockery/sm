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

    const init = async () => {
      const video = videoRef.current;
      const webarCanvas = webarCanvasRef.current;
      const threeCanvas = threeCanvasRef.current;
      if (!video || !webarCanvas || !threeCanvas) return;

      // Step 1: Load WebAR.rocks.face script
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

      // Set canvas dimensions BEFORE WebAR.rocks init
      const w = window.innerWidth;
      const h = window.innerHeight;
      webarCanvas.width = w;
      webarCanvas.height = h;
      threeCanvas.width = w;
      threeCanvas.height = h;

      // Initialize Three.js after video is ready
      const initThree = (videoWidth: number, videoHeight: number) => {
        threeRenderer = new THREE.WebGLRenderer({
          canvas: threeCanvas,
          alpha: true,
          antialias: true
        });
        threeRenderer.setSize(videoWidth, videoHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeRenderer.setClearColor(0x000000, 0);

        threeScene = new THREE.Scene();

        threeCamera = new THREE.PerspectiveCamera(40, videoWidth / videoHeight, 0.1, 100);
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
        // SM_HELMET_V3.GLB - updated Feb 1 2026
        loader.load(
          '/ar/helmet_facemask.glb',
          (gltf) => {
            if (isDestroyed) return;

            gltfHelmet = gltf.scene;
            gltfHelmet.traverse((o) => {
              if ((o as THREE.Mesh).isMesh) {
                (o as THREE.Mesh).frustumCulled = false;
              }
            });

            const baseScale = 1.0;
            gltfHelmet.scale.setScalar(baseScale);
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

        // Use window dimensions for Three.js
        initThree(window.innerWidth, window.innerHeight);
      };

      const callbackTrack = (detectState: any) => {
        if (isDestroyed || !helmetGroup || !gltfHelmet || !threeRenderer || !threeScene || !threeCamera) return;

        if (!detectState.detected || detectState.detected < 0.5) {
          helmetGroup.visible = false;
          threeRenderer.render(threeScene, threeCamera);
          return;
        }

        helmetGroup.visible = true;

        const s = detectState.s;      // scale
        const x = detectState.x;      // -1..1
        const y = detectState.y;      // -1..1
        const rx = detectState.rx;    // rotation X (pitch)
        const ry = detectState.ry;    // rotation Y (yaw)
        const rz = detectState.rz;    // rotation Z (roll)

        // Positioning parameters - tweak these to adjust fit
        const Z = 2.2;        // distance from camera
        const yOffset = 0.6;  // lift helmet above center
        const baseScale = 3.0;

        helmetGroup.position.set(
          x * Z,
          y * Z + yOffset,
          -Z
        );
        helmetGroup.rotation.set(rx, -ry, rz);
        helmetGroup.scale.setScalar(baseScale * s);

        threeRenderer.render(threeScene, threeCamera);
      };

      // Initialize WebAR.rocks
      setStatus('Initializing face tracking...');

      WEBARROCKSFACE.init({
        canvas: webarCanvas,
        NNCPath: '/webarrocks/neuralNets/NN_FACE_2.json',
        videoSettings: {
          facingMode: 'user',
          idealWidth: 1280,
          idealHeight: 720
        },
        callbackReady,
        callbackTrack
      });

      // Handle resize
      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

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
      id="webar-container"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      {/* Video element (hidden - WebAR.rocks uses its own) */}
      <video
        ref={videoRef}
        id="video"
        autoPlay
        playsInline
        muted
        style={{
          display: 'none',
        }}
      />

      {/* WebAR.rocks canvas - shows video + does face detection */}
      <canvas
        ref={webarCanvasRef}
        id="webar-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          transform: 'scaleX(-1)', // Mirror for selfie view
        }}
      />

      {/* Three.js canvas - 3D helmet overlay */}
      <canvas
        ref={threeCanvasRef}
        id="three-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)', // Mirror to match video
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
