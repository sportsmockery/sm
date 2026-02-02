'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function AR3HelmetPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let helmetModel: THREE.Object3D | null = null;
    let faceLandmarker: FaceLandmarker | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;
    let helmetSize = new THREE.Vector3();

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Step 1: Get camera stream
      setStatus('Requesting camera...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        await video.play();
      } catch (err) {
        console.error('Camera error:', err);
        setStatus('Camera access denied');
        return;
      }

      // Step 2: Setup Three.js FIRST
      const w = window.innerWidth;
      const h = window.innerHeight;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();

      // Orthographic camera - simpler for 2D overlay matching
      const aspect = w / h;
      const frustumSize = 2;
      camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100);
      camera.position.set(0, 0, 2);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(1, 1, 2);
      scene.add(dirLight);

      // Step 3: Load helmet model
      setStatus('Loading helmet...');
      const loader = new GLTFLoader();

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/ar/SM_v8.glb', resolve, undefined, reject);
        });

        helmetModel = gltf.scene;

        // Get bounding box to understand model size
        const box = new THREE.Box3().setFromObject(helmetModel);
        box.getSize(helmetSize);
        const center = box.getCenter(new THREE.Vector3());

        console.log('Helmet loaded - Size:', helmetSize.x.toFixed(2), helmetSize.y.toFixed(2), helmetSize.z.toFixed(2));
        console.log('Helmet center:', center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));

        // Center the model at origin
        helmetModel.position.sub(center);

        // Normalize scale so helmet fits in ~0.5 units
        const maxDim = Math.max(helmetSize.x, helmetSize.y, helmetSize.z);
        const normalizeScale = 0.5 / maxDim;
        helmetModel.scale.setScalar(normalizeScale);

        console.log('Normalize scale:', normalizeScale.toFixed(6));

        helmetModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
          }
        });

        // Rotate to face camera (helmet's front toward +Z)
        helmetModel.rotation.y = Math.PI;

        scene.add(helmetModel);

        // TEST: Show helmet at fixed position first
        helmetModel.visible = true;
        setDebugInfo(`Helmet loaded! Size: ${maxDim.toFixed(1)}, Scale: ${normalizeScale.toFixed(4)}`);

      } catch (err) {
        console.error('Helmet load error:', err);
        setStatus('Failed to load helmet');
        return;
      }

      // Step 4: Initialize MediaPipe
      setStatus('Loading face detection...');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          minFacePresenceConfidence: 0.5,
          minFaceDetectionConfidence: 0.5
        });
      } catch (err) {
        console.error('MediaPipe error:', err);
        setStatus('Face detection failed');
        return;
      }

      setStatus('Ready! Look at camera');

      // Step 5: Animation loop
      let frameCount = 0;
      const animate = (time: number) => {
        if (isDestroyed) return;
        animationId = requestAnimationFrame(animate);

        if (!faceLandmarker || !video || !renderer || !scene || !camera || !helmetModel) return;
        if (video.readyState < 2) return;

        frameCount++;
        const results = faceLandmarker.detectForVideo(video, time);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const lm = results.faceLandmarks[0];

          // Key points
          const nose = lm[1];
          const forehead = lm[10];
          const chin = lm[152];
          const leftCheek = lm[454];
          const rightCheek = lm[234];

          // Face center (use nose, slightly raised)
          const cx = nose.x;
          const cy = nose.y - 0.05; // Raise slightly for helmet

          // Convert normalized coords to NDC (-1 to 1), mirror X for selfie
          const ndcX = -(cx - 0.5) * 2;
          const ndcY = -(cy - 0.5) * 2;

          // Face width for scaling
          const faceWidth = Math.abs(leftCheek.x - rightCheek.x);

          // Map to 3D position (camera at z=2, so place helmet around z=0)
          const posX = ndcX * 1.2; // Scale to visible range
          const posY = ndcY * 1.2;
          const posZ = 0;

          // Scale: larger face = closer = bigger helmet
          // Typical faceWidth is ~0.15-0.25 when face fills frame
          const scale = faceWidth * 3;

          // Rotation from face orientation
          const dx = chin.x - forehead.x;
          const dy = chin.y - forehead.y;
          const dz = chin.z - forehead.z;

          const pitch = Math.atan2(dz, dy) * 0.5; // Nod
          const yaw = (nose.x - cx) * 3; // Turn (based on nose offset)
          const roll = Math.atan2(leftCheek.y - rightCheek.y, leftCheek.x - rightCheek.x);

          // Apply transforms
          helmetModel.position.set(posX, posY + 0.1, posZ);
          helmetModel.rotation.set(pitch, Math.PI - yaw, -roll);
          helmetModel.scale.setScalar(scale);
          helmetModel.visible = true;

          if (frameCount % 15 === 0) {
            setDebugInfo(
              `Face found | Pos: (${posX.toFixed(2)}, ${posY.toFixed(2)}) | ` +
              `Width: ${faceWidth.toFixed(3)} | Scale: ${scale.toFixed(3)}`
            );
          }
        } else {
          helmetModel.visible = false;
          if (frameCount % 15 === 0) {
            setDebugInfo('No face detected');
          }
        }

        renderer.render(scene, camera);
      };

      animationId = requestAnimationFrame(animate);

      // Resize handler
      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (renderer && camera) {
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        isDestroyed = true;
        window.removeEventListener('resize', handleResize);
        if (animationId) cancelAnimationFrame(animationId);
        faceLandmarker?.close();
        renderer?.dispose();
      };
    };

    init();

    return () => {
      isDestroyed = true;
    };
  }, []);

  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#000',
    }}>
      {/* Video element - camera feed */}
      <video
        ref={videoRef}
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

      {/* Three.js canvas - helmet overlay (NO CSS mirror - handled in 3D) */}
      <canvas
        ref={canvasRef}
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
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: 14,
        fontFamily: 'system-ui, sans-serif',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
      }}>
        {status}
      </div>

      {/* On-screen debug panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '10px 15px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#0f0',
        fontSize: 12,
        fontFamily: 'monospace',
        borderRadius: 5,
        zIndex: 20,
        maxWidth: '90%',
      }}>
        <div style={{ marginBottom: 5, color: '#ff0', fontWeight: 'bold' }}>
          AR3 DEBUG MODE - Check browser console for detailed logs
        </div>
        <div>{debugInfo || 'Waiting for face detection...'}</div>
      </div>
    </main>
  );
}
