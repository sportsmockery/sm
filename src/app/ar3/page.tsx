'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// ============= COMPREHENSIVE LOGGING FOR DEBUGGING =============
const DEBUG = true;
let logCounter = 0;
const LOG_INTERVAL = 30; // Log every 30 frames to avoid spam

function debugLog(label: string, data: Record<string, unknown>) {
  if (!DEBUG) return;
  logCounter++;
  if (logCounter % LOG_INTERVAL !== 0) return;

  console.log(`\n========== AR3 DEBUG [Frame ${logCounter}] ==========`);
  console.log(`>>> ${label}`);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'number') {
      console.log(`  ${key}: ${value.toFixed(4)}`);
    } else if (value instanceof THREE.Vector3) {
      console.log(`  ${key}: (x: ${value.x.toFixed(4)}, y: ${value.y.toFixed(4)}, z: ${value.z.toFixed(4)})`);
    } else if (value instanceof THREE.Quaternion) {
      console.log(`  ${key}: (x: ${value.x.toFixed(4)}, y: ${value.y.toFixed(4)}, z: ${value.z.toFixed(4)}, w: ${value.w.toFixed(4)})`);
    } else if (value instanceof THREE.Euler) {
      console.log(`  ${key}: (x: ${(value.x * 180 / Math.PI).toFixed(2)}°, y: ${(value.y * 180 / Math.PI).toFixed(2)}°, z: ${(value.z * 180 / Math.PI).toFixed(2)}°)`);
    } else if (Array.isArray(value)) {
      console.log(`  ${key}: [${value.slice(0, 6).map(v => typeof v === 'number' ? v.toFixed(4) : v).join(', ')}${value.length > 6 ? '...' : ''}]`);
    } else {
      console.log(`  ${key}:`, value);
    }
  });
}

export default function AR3HelmetPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState<string>('');

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

      console.log('========== AR3 INITIALIZATION ==========');
      console.log('Window size:', window.innerWidth, 'x', window.innerHeight);

      // Step 1: Get camera stream
      setStatus('Requesting camera...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        await video.play();
        console.log('Camera initialized:', video.videoWidth, 'x', video.videoHeight);
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
          minFacePresenceConfidence: 0.5,
          minFaceDetectionConfidence: 0.5
        });
        console.log('MediaPipe FaceLandmarker initialized successfully');
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

      // Camera positioned to view objects in front
      camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      camera.position.set(0, 0, 5); // Camera 5 units back, looking at origin
      camera.lookAt(0, 0, 0);

      console.log('Three.js camera setup:');
      console.log('  FOV:', camera.fov);
      console.log('  Aspect:', camera.aspect.toFixed(4));
      console.log('  Position:', camera.position.toArray());

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

            // Log helmet bounding box
            const box = new THREE.Box3().setFromObject(helmet);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            console.log('Helmet model loaded:');
            console.log('  Bounding box size:', size.x.toFixed(4), size.y.toFixed(4), size.z.toFixed(4));
            console.log('  Bounding box center:', center.x.toFixed(4), center.y.toFixed(4), center.z.toFixed(4));

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

      setStatus('Face tracking ready - CHECK CONSOLE FOR DEBUG LOGS');
      console.log('========== AR3 READY - TRACKING STARTED ==========');

      // Step 5: Animation loop with MediaPipe face detection
      let frameCount = 0;
      const animate = (time: number) => {
        if (isDestroyed) return;
        animationId = requestAnimationFrame(animate);

        if (!faceLandmarker || !video || !renderer || !scene || !camera || !helmetGroup) return;
        if (video.readyState < 2) return; // Video not ready

        frameCount++;

        // Run face detection
        const results = faceLandmarker.detectForVideo(video, time);

        // Check if we have face landmarks
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];

          // Key landmarks for position calculation
          // 10 = forehead center, 152 = chin, 1 = nose tip
          // 234 = right cheek, 454 = left cheek (for face width)
          const forehead = landmarks[10];
          const chin = landmarks[152];
          const nose = landmarks[1];
          const rightCheek = landmarks[234];
          const leftCheek = landmarks[454];

          // Calculate face center (between forehead and chin, slightly above nose)
          const faceCenterX = (forehead.x + chin.x) / 2;
          const faceCenterY = (forehead.y + chin.y) / 2;
          const faceCenterZ = (forehead.z + chin.z) / 2;

          // Calculate face width for scale
          const faceWidth = Math.sqrt(
            Math.pow(leftCheek.x - rightCheek.x, 2) +
            Math.pow(leftCheek.y - rightCheek.y, 2) +
            Math.pow(leftCheek.z - rightCheek.z, 2)
          );

          // MediaPipe landmarks are normalized 0-1, convert to 3D world coordinates
          // Camera is at z=5 looking at origin, so objects should be around z=0 to z=-2
          // X: 0-1 → -2 to 2 (and mirror for selfie view)
          // Y: 0-1 → 2 to -2 (flip because screen Y is down, 3D Y is up)
          // Z: depth (closer face = smaller Z landmark value = place closer to camera)
          const screenX = -(faceCenterX - 0.5) * 4; // Mirror and scale to visible range
          const screenY = -(faceCenterY - 0.5) * 4; // Flip and scale
          const screenZ = -faceCenterZ * 3; // Z depth scaling (landmarks z is small, typically -0.1 to 0.1)

          // Log landmark values periodically
          if (frameCount % LOG_INTERVAL === 0) {
            console.log(`\n>>> Frame ${frameCount}: Face detected via landmarks`);
            console.log('  Raw forehead:', `x:${forehead.x.toFixed(4)} y:${forehead.y.toFixed(4)} z:${forehead.z.toFixed(4)}`);
            console.log('  Raw nose:', `x:${nose.x.toFixed(4)} y:${nose.y.toFixed(4)} z:${nose.z.toFixed(4)}`);
            console.log('  Face center:', `x:${faceCenterX.toFixed(4)} y:${faceCenterY.toFixed(4)} z:${faceCenterZ.toFixed(4)}`);
            console.log('  Face width:', faceWidth.toFixed(4));
            console.log('  Screen coords:', `x:${screenX.toFixed(4)} y:${screenY.toFixed(4)} z:${screenZ.toFixed(4)}`);
          }

          // Calculate rotation from landmarks
          // Pitch (nodding): angle between forehead-chin line and vertical
          const faceHeightVec = new THREE.Vector3(
            chin.x - forehead.x,
            chin.y - forehead.y,
            chin.z - forehead.z
          ).normalize();

          // Yaw (turning): angle from nose to face center
          const noseOffsetX = nose.x - faceCenterX;

          // Roll (tilting): angle of the cheek-to-cheek line
          const cheekVec = new THREE.Vector3(
            leftCheek.x - rightCheek.x,
            leftCheek.y - rightCheek.y,
            leftCheek.z - rightCheek.z
          );

          // Calculate Euler angles
          const pitch = Math.asin(-faceHeightVec.z) * 0.8; // Dampen
          const yaw = noseOffsetX * Math.PI * 2; // Convert offset to angle, mirror
          const roll = Math.atan2(cheekVec.y, cheekVec.x); // Tilt angle

          // Scale based on face width (larger face = closer = bigger helmet)
          const baseScale = 2.5; // Base scale for helmet
          const depthScale = faceWidth * 8; // Scale factor from face width
          const finalScale = baseScale * depthScale;

          debugLog('LANDMARK-BASED TRACKING', {
            screenPosition: new THREE.Vector3(screenX, screenY, screenZ),
            rotation: { pitch: pitch * 180/Math.PI, yaw: yaw * 180/Math.PI, roll: roll * 180/Math.PI },
            faceWidth: faceWidth,
            scale: finalScale
          });

          // Apply to helmet
          helmetGroup.position.set(screenX, screenY + 0.3, screenZ); // Offset Y up for crown
          helmetGroup.rotation.set(
            pitch,           // Pitch (nodding)
            -yaw + Math.PI,  // Yaw (turning) + 180° to face camera
            -roll + Math.PI/2 // Roll (tilting)
          );
          helmetGroup.scale.setScalar(finalScale);
          helmetGroup.visible = true;

          // Update on-screen debug info
          if (frameCount % 10 === 0) {
            setDebugInfo(
              `Pos: (${screenX.toFixed(2)}, ${screenY.toFixed(2)}, ${screenZ.toFixed(2)}) | ` +
              `Scale: ${finalScale.toFixed(3)} | FaceW: ${faceWidth.toFixed(3)} | ` +
              `Frame: ${frameCount}`
            );
          }

        } else {
          helmetGroup.visible = false;
          if (frameCount % LOG_INTERVAL === 0) {
            console.log(`>>> Frame ${frameCount}: No face detected`);
          }
          if (frameCount % 10 === 0) {
            setDebugInfo('No face detected - Frame: ' + frameCount);
          }
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
