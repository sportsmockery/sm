'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function AR3HelmetPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let helmetGroup: THREE.Group | null = null;
    let faceLandmarker: FaceLandmarker | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;

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

      // Step 2: Initialize MediaPipe Face Landmarker
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
          outputFacialTransformationMatrixes: true, // Get 3D transform matrix
          minTrackingConfidence: 0.5,
          minDetectionConfidence: 0.5
        });
      } catch (err) {
        console.error('MediaPipe error:', err);
        setStatus('Face detection failed to load');
        return;
      }

      // Step 3: Setup Three.js
      const w = window.innerWidth;
      const h = window.innerHeight;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();

      // Camera positioned to match video perspective
      camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      camera.position.set(0, 0, 0);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(0.5, 1, 2);
      scene.add(directionalLight);

      // Create helmet group
      helmetGroup = new THREE.Group();
      scene.add(helmetGroup);

      // Step 4: Load helmet model
      setStatus('Loading helmet...');
      const loader = new GLTFLoader();
      await new Promise<void>((resolve, reject) => {
        loader.load(
          '/ar/SM_v8.glb',
          (gltf) => {
            if (isDestroyed) return;
            const helmet = gltf.scene;

            // No base rotation - let tracking handle it
            helmet.rotation.set(0, 0, 0);

            helmet.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.frustumCulled = false;
                if (mesh.material) {
                  (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
                }
              }
            });

            helmetGroup!.add(helmet);
            resolve();
          },
          (progress) => {
            const pct = ((progress.loaded / progress.total) * 100).toFixed(0);
            setStatus(`Loading helmet: ${pct}%`);
          },
          (err) => {
            console.error('Helmet load error:', err);
            reject(err);
          }
        );
      });

      setStatus('Face tracking ready');

      // Step 5: Animation loop with MediaPipe face detection
      let lastTime = 0;
      const animate = (time: number) => {
        if (isDestroyed) return;
        animationId = requestAnimationFrame(animate);

        if (!faceLandmarker || !video || !renderer || !scene || !camera || !helmetGroup) return;
        if (video.readyState < 2) return; // Video not ready

        // Run face detection
        const results = faceLandmarker.detectForVideo(video, time);

        // Use facialTransformationMatrixes for robust 6DoF tracking
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
          const matrixData = results.facialTransformationMatrixes[0].data; // 16-element array (row-major 4x4)

          // Create Three.js Matrix4 (column-major: transpose MediaPipe row-major)
          const faceMatrix = new THREE.Matrix4().fromArray(matrixData).transpose();

          // Mirror for selfie: flip X (since video mirrored, canvas not)
          const mirrorMatrix = new THREE.Matrix4().makeScale(-1, 1, 1);
          faceMatrix.multiply(mirrorMatrix);

          // Coord conversion: MediaPipe (y down, z away) to Three.js (y up, z out)
          // Flip Y and Z signs
          const coordMatrix = new THREE.Matrix4().makeScale(1, -1, -1);
          faceMatrix.multiply(coordMatrix);

          // Decompose: extract position, quaternion (for rotation), scale
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          const scaleVec = new THREE.Vector3();
          faceMatrix.decompose(position, quaternion, scaleVec);

          // Uniform scale: average (matrix assumes uniform; helmet is rigid)
          const uniformScale = (scaleVec.x + scaleVec.y + scaleVec.z) / 3 * 1.2; // Slight boost for helmet fit

          // Apply to helmetGroup
          helmetGroup.position.copy(position);
          helmetGroup.quaternion.copy(quaternion);
          helmetGroup.scale.set(uniformScale, uniformScale, uniformScale);

          // Offsets: Matrix centers on face surface; adjust for helmet
          // Up Y for crown, back Z to enclose head (units ~1-2 for face width)
          helmetGroup.position.y += 0.25; // Raise for crown
          helmetGroup.position.z -= 0.15; // Push deeper on head

          // Fix backwards: Rotate 180° Y if facemask faces user (common GLTF +Z forward issue)
          helmetGroup.rotation.y += Math.PI;

          helmetGroup.visible = true;

        } else {
          helmetGroup.visible = false;
        }

        renderer.render(scene, camera);
      };

      animationId = requestAnimationFrame(animate);

      // Handle resize
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
    </main>
  );
}
