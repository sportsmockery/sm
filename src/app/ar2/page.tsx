'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare global {
  interface Window {
    WEBARROCKSFACE: any;
    smHelmetGroup: THREE.Group | null;
  }
}

export default function ARHelmetPage2() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;
    let faceDetected = false;
    let lastPose: any = null;

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detectionCanvas = detectionCanvasRef.current;
      if (!video || !canvas || !detectionCanvas) return;

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

      // Step 2: Setup Three.js with transparent background
      const w = window.innerWidth;
      const h = window.innerHeight;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false
      });
      renderer.setClearColor(0x000000, 0); // Fully transparent
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();

      // Camera setup - set once, do not modify later
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 3); // 3 units back
      camera.lookAt(0, 0, 0); // Looking at origin

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(0.5, 1, 2);
      scene.add(directionalLight);

      const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
      backLight.position.set(-0.5, -1, -2);
      scene.add(backLight);

      // Step 3: Load helmet model V2
      setStatus('Loading helmet model...');
      const loader = new GLTFLoader();

      loader.load(
        '/models/sm_helmet_black2.glb',
        (gltf) => {
          if (isDestroyed) return;

          const helmetGroup = new THREE.Group();
          const helmet = gltf.scene;

          // Reset raw model transforms
          helmet.position.set(0, 0, 0);
          helmet.rotation.set(0, 0, 0);
          helmet.scale.set(1, 1, 1); // Leave raw model at scale 1

          // Traverse meshes - keep original materials
          helmet.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.frustumCulled = false;
            }
          });

          helmetGroup.add(helmet);

          // Scale the GROUP - keep this scale
          const SCALE = 0.02;
          helmetGroup.scale.set(SCALE, SCALE, SCALE);
          helmetGroup.position.set(0, 0, 0);
          helmetGroup.visible = false; // Hide until face detected

          scene.add(helmetGroup);
          window.smHelmetGroup = helmetGroup;

          console.log('Helmet V2 loaded successfully');
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

      // Step 4: Initialize WebAR.rocks for face detection only
      // Use hidden canvas - we only want pose data, not its rendering
      detectionCanvas.width = 640;
      detectionCanvas.height = 480;

      setStatus('Initializing face tracking...');

      WEBARROCKSFACE.init({
        canvas: detectionCanvas,
        NNCPath: '/webarrocks/neuralNets/NN_FACE_2.json',
        videoSettings: {
          facingMode: 'user',
          idealWidth: 1280,
          idealHeight: 720
        },
        callbackReady: (errCode: number) => {
          if (errCode) {
            console.error('WEBARROCKSFACE init error:', errCode);
            setStatus('Face tracking error');
            return;
          }
          console.log('WebARRocksFace initialized');
          setStatus('Face tracking ready - look at camera');

          // Copy the video stream to our visible video element
          const webARVideo = detectionCanvas.parentElement?.querySelector('video');
          if (webARVideo && webARVideo.srcObject) {
            video.srcObject = webARVideo.srcObject;
            video.play();
          }
        },
        callbackTrack: (detectState: any) => {
          if (isDestroyed) return;

          // Store pose data for render loop
          if (detectState.detected > 0.5) {
            faceDetected = true;
            lastPose = {
              x: detectState.x,       // -1 to 1 (horizontal)
              y: detectState.y,       // -1 to 1 (vertical)
              s: detectState.s,       // scale
              rx: detectState.rx,     // rotation X (pitch)
              ry: detectState.ry,     // rotation Y (yaw)
              rz: detectState.rz      // rotation Z (roll)
            };
          } else {
            faceDetected = false;
          }
        }
      });

      // Step 5: Render loop - update helmet from face pose
      const animate = () => {
        if (isDestroyed || !renderer) return;
        animationId = requestAnimationFrame(animate);

        const helmetGroup = window.smHelmetGroup;
        if (helmetGroup) {
          if (faceDetected && lastPose) {
            helmetGroup.visible = true;

            // Map face position to 3D space
            // x, y are in range -1 to 1, map to reasonable 3D coordinates
            helmetGroup.position.set(
              lastPose.x * 1.5,           // Horizontal movement
              lastPose.y * 1.5 + 0.2,     // Vertical movement + slight offset up
              0                            // Keep at z=0
            );

            // Apply face rotation using Euler angles
            // Negate ry for mirror effect (video is mirrored)
            helmetGroup.rotation.set(
              lastPose.rx,      // Pitch (nodding)
              -lastPose.ry,     // Yaw (turning head) - negated for mirror
              lastPose.rz       // Roll (tilting head)
            );

            // Scale based on face size (how close to camera)
            const baseScale = 0.02;
            const scaleMultiplier = lastPose.s * 1.5;
            helmetGroup.scale.setScalar(baseScale * scaleMultiplier);
          } else {
            helmetGroup.visible = false;
          }
        }

        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (renderer) {
          renderer.setSize(w, h);
        }
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

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
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      {/* Hidden canvas for WebAR.rocks face detection */}
      <canvas
        ref={detectionCanvasRef}
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

      {/* Native video element - camera feed background (fallback) */}
      <video
        ref={videoRef}
        id="sm-ar-video"
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror for selfie view
          zIndex: 0,
          display: 'none', // Hidden - WebAR.rocks canvas shows video
        }}
      />

      {/* Three.js canvas - 3D helmet overlay */}
      <canvas
        ref={canvasRef}
        id="sm-ar-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
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
