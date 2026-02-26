'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Lerp helper
function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export default function AR3HelmetPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let helmetModel: THREE.Object3D | null = null;
    let faceLandmarker: FaceLandmarker | null = null;
    let animationId: number | null = null;
    let isDestroyed = false;

    // Smoothing state
    const prevPos = new THREE.Vector3();
    const prevQuat = new THREE.Quaternion();
    let prevScl = 1;
    let videoAspect = 1;

    const init = async () => {
      console.log('========== AR3 v49 - POSITION + SCALE FIX ==========');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        console.error('Video or canvas ref not available');
        return;
      }

      // Step 1: Get camera stream
      setStatus('Requesting camera...');
      console.log('Requesting camera access...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        await video.play();
        console.log('Camera ready:', video.videoWidth, 'x', video.videoHeight);
      } catch (err) {
        console.error('Camera error:', err);
        setStatus('Camera access denied');
        return;
      }

      // Step 2: Setup Three.js with OrthographicCamera for AR overlay
      const w = window.innerWidth;
      const h = window.innerHeight;
      videoAspect = video.videoWidth / video.videoHeight || w / h;
      console.log('Video aspect ratio:', videoAspect);

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene = new THREE.Scene();

      // OrthographicCamera - units are in "face widths" roughly
      camera = new THREE.OrthographicCamera(
        -videoAspect / 2, videoAspect / 2,
        0.5, -0.5,
        0.001, 100
      );
      camera.position.set(0, 0, 1);
      console.log('Camera setup - Orthographic, aspect:', videoAspect);
      console.log('Camera frustum: L', camera.left, 'R', camera.right, 'T', camera.top, 'B', camera.bottom);

      // STRONG lighting to ensure visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
      dirLight.position.set(0, 1, 2);
      scene.add(dirLight);
      const frontLight = new THREE.DirectionalLight(0xffffff, 2.5);
      frontLight.position.set(0, 0, 5);
      scene.add(frontLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
      fillLight.position.set(-2, 0, 1);
      scene.add(fillLight);
      console.log('Lighting: Ambient 3.0, Dir 3.0, Front 2.5, Fill 1.5');

      // Step 3: Load helmet model
      setStatus('Loading helmet...');
      console.log('Setting up GLTF loader with Draco support...');

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      try {
        console.log('Loading helmet model: /ar/SM_v9.glb');
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/ar/SM_v9.glb',
            (result) => {
              console.log('Helmet GLTF loaded successfully');
              resolve(result);
            },
            (progress) => {
              if (progress.total > 0) {
                const pct = ((progress.loaded / progress.total) * 100).toFixed(0);
                console.log(`Helmet loading: ${pct}%`);
              }
            },
            (error) => {
              console.error('Helmet load error:', error);
              reject(error);
            }
          );
        });

        const loadedHelmet = gltf.scene;
        helmetModel = loadedHelmet;

        // Measure baked size
        const box = new THREE.Box3().setFromObject(loadedHelmet);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log('=== HELMET MODEL INFO ===');
        console.log('Baked size (meters):', size.x.toFixed(4), size.y.toFixed(4), size.z.toFixed(4));
        console.log('Baked center:', center.x.toFixed(4), center.y.toFixed(4), center.z.toFixed(4));
        console.log('Size magnitude:', size.length().toFixed(4));

        // Reset transform
        loadedHelmet.position.set(0, 0, 0);
        loadedHelmet.scale.setScalar(1);
        loadedHelmet.rotation.set(0, 0, 0);

        // Process materials - REPLACE with MeshBasicMaterial (unlit, GUARANTEED visible)
        let meshCount = 0;
        loadedHelmet.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
            meshCount++;

            const oldMat = mesh.material as THREE.Material;
            console.log(`Mesh ${meshCount}: ${mesh.name}, Original material: ${oldMat.type}`);

            // REPLACE with MeshBasicMaterial - ignores lighting entirely
            // Bears navy blue: #0B162A, lighter version for visibility: #1a3a5c
            const newMat = new THREE.MeshBasicMaterial({
              color: meshCount === 1 ? 0x1a3a5c : 0x8B8B8B, // Navy for shell, gray for facemask
              transparent: false,
              side: THREE.DoubleSide,
            });
            mesh.material = newMat;
            console.log(`  → Replaced with MeshBasicMaterial, color: ${meshCount === 1 ? '#1a3a5c (navy)' : '#8B8B8B (gray)'}`);
          }
        });
        console.log('Total meshes processed:', meshCount, '- ALL replaced with MeshBasicMaterial');

        scene.add(loadedHelmet);
        loadedHelmet.visible = false;

        console.log('Helmet added to scene, initially hidden');

      } catch (err) {
        console.error('Helmet load error:', err);
        setStatus('Failed to load helmet');
        return;
      }

      // Step 4: Initialize MediaPipe
      setStatus('Loading face detection...');
      console.log('Initializing MediaPipe FaceLandmarker...');

      const mediaPipeOptions = {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU' as const
        },
        runningMode: 'VIDEO' as const,
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true,
        minFacePresenceConfidence: 0.5,
        minFaceDetectionConfidence: 0.5
      };

      try {
        const visionPromise = FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const vision = await Promise.race([
          visionPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Vision load timeout (10s)')), 10000)
          )
        ]);
        console.log('Vision WASM loaded');

        faceLandmarker = await FaceLandmarker.createFromOptions(vision, mediaPipeOptions);
        console.log('MediaPipe ready with GPU delegate');

      } catch (err) {
        console.warn('GPU MediaPipe failed, trying CPU fallback:', err);
        setStatus('Trying CPU fallback...');

        try {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          );
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            ...mediaPipeOptions,
            baseOptions: {
              ...mediaPipeOptions.baseOptions,
              delegate: 'CPU' as const
            }
          });
          console.log('MediaPipe ready with CPU fallback');
        } catch (fallbackErr) {
          console.error('MediaPipe CPU fallback failed:', fallbackErr);
          setStatus('Face detection failed');
          return;
        }
      }

      setStatus('Ready! Look at camera to try on the helmet');
      console.log('========== INIT COMPLETE, STARTING ANIMATION LOOP ==========');

      // Step 5: Animation loop with DIAGNOSTIC LOGGING
      let frameCount = 0;
      const animate = (time: number) => {
        if (isDestroyed) return;
        animationId = requestAnimationFrame(animate);

        if (!faceLandmarker || !video || !renderer || !scene || !camera || !helmetModel) return;
        if (video.readyState < 2) return;

        frameCount++;
        const results = faceLandmarker.detectForVideo(video, time);

        let tracked = false;

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const lm = results.faceLandmarks[0];

          // ========================================
          // LANDMARK-BASED POSITIONING
          // ========================================
          const foreheadCenter = lm[10]; // Top of forehead
          const noseBridge = lm[6]; // Between eyes
          const leftTemple = lm[234];
          const rightTemple = lm[454];
          const chin = lm[152];

          // Log raw landmarks every 30 frames
          if (frameCount % 30 === 1) {
            console.log('=== LANDMARK DEBUG (Frame ' + frameCount + ') ===');
            console.log('Forehead [10]:', { x: foreheadCenter.x.toFixed(4), y: foreheadCenter.y.toFixed(4), z: foreheadCenter.z.toFixed(4) });
            console.log('NoseBridge [6]:', { x: noseBridge.x.toFixed(4), y: noseBridge.y.toFixed(4), z: noseBridge.z.toFixed(4) });
            console.log('LeftTemple [234]:', { x: leftTemple.x.toFixed(4), y: leftTemple.y.toFixed(4), z: leftTemple.z.toFixed(4) });
            console.log('RightTemple [454]:', { x: rightTemple.x.toFixed(4), y: rightTemple.y.toFixed(4), z: rightTemple.z.toFixed(4) });
            console.log('Chin [152]:', { x: chin.x.toFixed(4), y: chin.y.toFixed(4), z: chin.z.toFixed(4) });
          }

          // Convert landmark to Three.js coordinates
          // Landmarks are 0-1 normalized, need to map to ortho camera space
          const toThreeJS = (landmark: { x: number; y: number; z: number }) => {
            // X: 0-1 → -aspect/2 to +aspect/2, MIRRORED for selfie
            const x = -(landmark.x - 0.5) * videoAspect;
            // Y: 0-1 → +0.5 to -0.5 (flip Y)
            const y = -(landmark.y - 0.5);
            // Z: landmark.z is relative depth, scale it
            const z = -landmark.z * 2;
            return new THREE.Vector3(x, y, z);
          };

          const foreheadPos = toThreeJS(foreheadCenter);
          const leftTemplePos = toThreeJS(leftTemple);
          const rightTemplePos = toThreeJS(rightTemple);
          const chinPos = toThreeJS(chin);

          // Face width for scale
          const faceWidth = leftTemplePos.distanceTo(rightTemplePos);
          // Face height
          const faceHeight = foreheadPos.distanceTo(chinPos);

          // Position: Well above forehead center (helmet sits ON TOP of head)
          const posX = foreheadPos.x;
          const posY = foreheadPos.y + faceHeight * 0.35; // 35% above forehead - helmet on top of head
          const posZ = foreheadPos.z - 0.05;

          // Scale based on face width
          // Face width ~0.25-0.35 in ortho units when face fills frame
          // Helmet model is ~0.2m, we want it to cover the head
          const targetScale = faceWidth * 5; // Increased multiplier for better coverage
          const uniformScl = Math.max(1.0, Math.min(2.5, targetScale)); // Raised minimum to 1.0

          // Rotation from landmarks
          const faceUp = new THREE.Vector3().subVectors(foreheadPos, chinPos).normalize();
          const faceRight = new THREE.Vector3().subVectors(rightTemplePos, leftTemplePos).normalize();
          const faceForward = new THREE.Vector3().crossVectors(faceRight, faceUp).normalize();

          // Build rotation matrix
          const rotMat = new THREE.Matrix4().makeBasis(faceRight, faceUp, faceForward);
          const quat = new THREE.Quaternion().setFromRotationMatrix(rotMat);

          // Apply 180° Y rotation so facemask faces camera
          const flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
          quat.multiply(flipY);

          // Log converted values
          if (frameCount % 30 === 1) {
            console.log('--- Converted Values ---');
            console.log('Forehead 3D:', foreheadPos.toArray().map(v => v.toFixed(4)));
            console.log('Face width:', faceWidth.toFixed(4));
            console.log('Face height:', faceHeight.toFixed(4));
            console.log('Target position:', { x: posX.toFixed(4), y: posY.toFixed(4), z: posZ.toFixed(4) });
            console.log('Target scale:', uniformScl.toFixed(4));
            console.log('Quaternion:', quat.toArray().map(v => v.toFixed(4)));
          }

          // Apply to helmet
          helmetModel.position.set(posX, posY, posZ);
          helmetModel.quaternion.copy(quat);
          helmetModel.scale.setScalar(uniformScl);

          tracked = true;
        }

        if (tracked && helmetModel) {
          // Apply smoothing
          helmetModel.position.lerp(prevPos.clone(), 0.2);
          helmetModel.quaternion.slerp(prevQuat.clone(), 0.2);
          const smoothedScl = lerp(helmetModel.scale.x, prevScl, 0.2);
          helmetModel.scale.setScalar(smoothedScl);

          // Update prev for next frame
          prevPos.copy(helmetModel.position);
          prevQuat.copy(helmetModel.quaternion);
          prevScl = helmetModel.scale.x;

          helmetModel.visible = true;

          // Update debug display
          if (frameCount % 10 === 0) {
            setDebugInfo(
              `Pos: (${helmetModel.position.x.toFixed(3)}, ${helmetModel.position.y.toFixed(3)}, ${helmetModel.position.z.toFixed(3)}) | ` +
              `Scale: ${helmetModel.scale.x.toFixed(3)} | Frame: ${frameCount}`
            );
          }
        } else if (helmetModel) {
          helmetModel.visible = false;
          if (frameCount % 30 === 0) {
            setDebugInfo(`No face detected - Frame: ${frameCount}`);
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
          videoAspect = video.videoWidth / video.videoHeight || w / h;
          camera.left = -videoAspect / 2;
          camera.right = videoAspect / 2;
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
      backgroundColor: 'var(--sm-dark, #000)',
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
          transform: 'scaleX(-1)',
        }}
      />

      {/* Three.js canvas - helmet overlay */}
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
        color: 'var(--sm-text, #fff)',
        fontSize: 'var(--text-sm, 14px)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        padding: '8px 16px',
        borderRadius: 'var(--sm-radius-pill, 100px)',
        border: '1px solid var(--sm-border, rgba(255,255,255,0.06))',
      }}>
        {status}
      </div>

      {/* Debug panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '10px 15px',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        color: '#0f0',
        fontSize: 'var(--text-xs, 12px)',
        fontFamily: "'Space Grotesk', sans-serif",
        borderRadius: 'var(--sm-radius-sm, 10px)',
        border: '1px solid var(--sm-border, rgba(255,255,255,0.06))',
        zIndex: 20,
        maxWidth: '60%',
      }}>
        <div style={{ marginBottom: 5, color: '#ff0', fontWeight: 'bold' }}>
          AR3 v49 - POSITION FIX
        </div>
        <div style={{ marginBottom: 5, color: '#0ff' }}>
          Helmet raised to sit ON TOP of head
        </div>
        <div>{debugInfo || 'Initializing...'}</div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        color: 'var(--sm-text, #fff)',
        fontSize: 'var(--text-sm, 13px)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        borderRadius: 'var(--sm-radius-pill, 100px)',
        border: '1px solid var(--sm-border, rgba(255,255,255,0.06))',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '90%',
      }}>
        Position your face in front of the camera to try on the Bears helmet.
      </div>
    </main>
  );
}
