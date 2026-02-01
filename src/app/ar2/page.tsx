'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ARHelmetPage2() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Step 1: Get camera stream
      setStatus('Requesting camera access...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        video.srcObject = stream;
        await video.play();
        setStatus('Camera ready');
      } catch (err) {
        console.error('Camera error:', err);
        setStatus('Camera access denied');
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
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.set(0, 0, 5); // Camera 5 units back

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

      let helmet: THREE.Object3D | null = null;

      loader.load(
        '/models/sm_helmet_black2.glb',
        (gltf) => {
          if (isDestroyed) return;

          helmet = gltf.scene;

          // Traverse meshes - keep original materials
          helmet.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.frustumCulled = false;
              console.log('Mesh material:', (mesh.material as THREE.Material).type);
            }
          });

          // Position helmet at origin, visible and static
          helmet.position.set(0, 0, 0);
          helmet.scale.set(1, 1, 1);
          helmet.visible = true;

          scene.add(helmet);
          setStatus('Helmet V2 loaded - static test');
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

      // Step 4: Basic render loop (no WebAR.rocks)
      const animate = () => {
        if (isDestroyed || !renderer) return;
        animationId = requestAnimationFrame(animate);

        // Optional: slow rotation for visibility test
        if (helmet) {
          helmet.rotation.y += 0.005;
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
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
      });

      return () => {
        isDestroyed = true;
        window.removeEventListener('resize', handleResize);
        if (animationId) cancelAnimationFrame(animationId);
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
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
      {/* Native video element - camera feed background */}
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
