'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare global {
  interface Window {
    WEBARROCKSFACE: any;
  }
}

export default function ARHelmetPage2() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const helmetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 1) Load WebAR.rocks.face script from /public
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

      // 2) Three.js renderer, scene, camera
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer!.setSize(w, h);
        renderer!.setPixelRatio(window.devicePixelRatio);
      };
      resize();
      window.addEventListener('resize', resize);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 5);

      const light = new THREE.DirectionalLight(0xffffff, 1.3);
      light.position.set(0, 1, 2);
      scene.add(light);

      // 3) Load SM helmet model (version 2)
      const loader = new GLTFLoader();
      loader.load(
        '/models/sm_helmet_black2.glb',
        (gltf) => {
          helmetRef.current = gltf.scene;
          gltf.scene.traverse((obj) => {
            if ((obj as any).isMesh) {
              (obj as any).frustumCulled = false;
            }
          });
          gltf.scene.scale.set(1.1, 1.1, 1.1);
          scene.add(gltf.scene);
        },
        undefined,
        (err) => console.error('Helmet load error', err)
      );

      // 4) Start WebAR.rocks.face tracking
      WEBARROCKSFACE.init({
        canvasId: canvas.id,
        NNCPath: '/webarrocks/neuralNets/NN_FACE_2.json',
        callbackReady: (errCode: number) => {
          if (errCode) console.error('WEBARROCKSFACE init error', errCode);
        },
        callbackTrack: (detectState: any) => {
          const helmet = helmetRef.current;

          if (helmet && detectState.detected > 0.5) {
            const x = detectState.x; // -1..1
            const y = detectState.y; // -1..1
            const s = detectState.s; // scale

            helmet.visible = true;
            helmet.position.set(x * 1.5, y * 1.8, 0);
            helmet.rotation.set(detectState.rx, detectState.ry, detectState.rz);

            const baseScale = 1.4;
            helmet.scale.setScalar(baseScale * s);
          } else if (helmet) {
            helmet.visible = false;
          }

          renderer!.render(scene, camera);
        },
      });

      return () => {
        window.removeEventListener('resize', resize);
        try {
          WEBARROCKSFACE.destroy && WEBARROCKSFACE.destroy();
        } catch {
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
      }}
    >
      <canvas
        id="WebARRocksFaceCanvas2"
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </main>
  );
}
