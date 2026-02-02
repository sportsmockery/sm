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
      console.log('========== AR3 v46 INIT START ==========');
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

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();

      // OrthographicCamera for pixel-accurate AR overlay
      camera = new THREE.OrthographicCamera(
        -videoAspect / 2, videoAspect / 2,
        0.5, -0.5,
        0.001, 100
      );
      camera.position.set(0, 0, 1);

      // Lighting - STRONG to fix black helmet
      scene.add(new THREE.AmbientLight(0xffffff, 2.0)); // Increased from 1.2
      const dirLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased from 1.5
      dirLight.position.set(0, 1, 2);
      scene.add(dirLight);
      const frontLight = new THREE.DirectionalLight(0xffffff, 2.0); // Added front light
      frontLight.position.set(0, 0, 3);
      scene.add(frontLight);
      const backLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased from 0.5
      backLight.position.set(-1, -1, -1);
      scene.add(backLight);

      // Step 3: Load helmet model (SM_v9 - Blender baked: 0.2-0.3m, origin head base, +Z facemask)
      setStatus('Loading helmet...');
      console.log('Setting up GLTF loader with Draco support...');

      // Configure DRACOLoader for compressed GLB files
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      try {
        console.log('Loading helmet model...');
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

        // No normalization - rely on Blender baked scale
        loadedHelmet.position.set(0, 0, 0);
        loadedHelmet.scale.setScalar(1);

        // Log model info
        const box = new THREE.Box3().setFromObject(loadedHelmet);
        const size = box.getSize(new THREE.Vector3());
        console.log('Helmet loaded - Baked size:', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));

        loadedHelmet.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
            // Ensure materials are visible and properly lit
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.isMeshStandardMaterial) {
                mat.metalness = Math.min(mat.metalness, 0.5); // Reduce metalness to improve visibility
                mat.roughness = Math.max(mat.roughness, 0.3); // Ensure some roughness
              }
            }
          }
        });

        // Add head mask sphere (occludes helmet interior)
        const maskGeom = new THREE.SphereGeometry(0.08, 32, 32);
        const maskMat = new THREE.MeshBasicMaterial({ colorWrite: false });
        const headMask = new THREE.Mesh(maskGeom, maskMat);
        headMask.position.set(0, 0, 0);
        headMask.renderOrder = -1; // Render first for depth
        loadedHelmet.add(headMask);

        scene.add(loadedHelmet);
        loadedHelmet.visible = false;

        console.log('Helmet ready with head mask');

      } catch (err) {
        console.error('Helmet load error:', err);
        setStatus('Failed to load helmet');
        return;
      }

      // Step 4: Initialize MediaPipe with matrix output (with timeout and CPU fallback)
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
        // Load vision with timeout
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

        // Try GPU first
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
          setStatus('Face detection failed: ' + (fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'));
          return;
        }
      }

      setStatus('Ready! Look at camera');
      console.log('========== AR3 v46 INIT COMPLETE ==========');

      // Step 5: Animation loop
      let frameCount = 0;
      const animate = (time: number) => {
        if (isDestroyed) return;
        animationId = requestAnimationFrame(animate);

        if (!faceLandmarker || !video || !renderer || !scene || !camera || !helmetModel) return;
        if (video.readyState < 2) return;

        frameCount++;
        const results = faceLandmarker.detectForVideo(video, time);

        let tracked = false;

        // Use face landmarks for position, matrix for rotation
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const lm = results.faceLandmarks[0];

          // Get face position from landmarks (normalized 0-1)
          const nose = lm[1];
          const forehead = lm[10];
          const leftCheek = lm[454];
          const rightCheek = lm[234];

          // Face center X/Y from nose, adjusted for forehead
          const cx = nose.x;
          const cy = forehead.y + 0.02; // Slightly above forehead for helmet crown

          // Convert to NDC with mirror for selfie
          const ndcX = -(cx - 0.5) * 2;
          const posX = ndcX * videoAspect;
          const posY = -(cy - 0.5) * 2;

          // Depth from face Z (average of key points)
          const avgZ = (nose.z + forehead.z + lm[152].z) / 3;
          const posZ = avgZ * -5 - 0.5; // Scale and offset for Z

          // Face width for scale
          const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
          const uniformScl = Math.max(1.0, Math.min(1.5, faceWidth * 8));

          // Try to get rotation from matrix if available
          let quat = new THREE.Quaternion();
          if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
            const matrixData = results.facialTransformationMatrixes[0].data;

            // Extract rotation from matrix (upper-left 3x3)
            const rotMatrix = new THREE.Matrix4().fromArray([
              matrixData[0], matrixData[1], matrixData[2], 0,
              matrixData[4], matrixData[5], matrixData[6], 0,
              matrixData[8], matrixData[9], matrixData[10], 0,
              0, 0, 0, 1
            ]).transpose();

            // Coordinate conversion
            const coordConvert = new THREE.Matrix4().makeScale(1, -1, -1);
            const mirrorConvert = new THREE.Matrix4().makeScale(-1, 1, 1);
            rotMatrix.premultiply(coordConvert);
            rotMatrix.multiply(mirrorConvert);

            quat.setFromRotationMatrix(rotMatrix);

            // Apply 180° Y rotation for facemask forward
            const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
            quat.premultiply(flipQuat);
          } else {
            // Fallback rotation from landmarks
            const pitch = Math.atan2(lm[152].z - forehead.z, lm[152].y - forehead.y) * 0.5;
            const yaw = (nose.x - cx) * -4;
            const roll = Math.atan2(leftCheek.y - rightCheek.y, leftCheek.x - rightCheek.x);
            quat.setFromEuler(new THREE.Euler(pitch, Math.PI + yaw, -roll, 'YXZ'));
          }

          // Apply transforms
          helmetModel.position.set(posX, posY, posZ);
          helmetModel.quaternion.copy(quat);
          helmetModel.scale.setScalar(uniformScl);

          tracked = true;

          if (frameCount % 15 === 0) {
            console.log(`Frame ${frameCount}: Pos(${posX.toFixed(2)},${posY.toFixed(2)},${posZ.toFixed(2)}), Scl ${uniformScl.toFixed(2)}, FaceW ${faceWidth.toFixed(3)}`);
          }

        // No face detected
        } else if (false) { // Disabled old fallback
          const lm = results.faceLandmarks[0];

          const nose = lm[1];
          const forehead = lm[10];
          const chin = lm[152];
          const leftCheek = lm[454];
          const rightCheek = lm[234];

          // Face center
          const cx = nose.x;
          const cy = nose.y - 0.05;

          // Depth from z landmarks
          const cz = (nose.z + forehead.z + chin.z) / 3;
          const posZ = cz * -500 - 0.6; // Match -0.6 base offset

          // Face width for scale (using *8 boost, clamped 1.0-1.5)
          const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
          const scale = Math.max(1.0, Math.min(1.5, faceWidth * 8));

          // NDC coords with mirror
          const ndcX = -(cx - 0.5) * 2;
          const posX = ndcX * videoAspect;
          const posY = -(cy - 0.5) * 2 + 0.2; // Match matrix path Y offset

          // Rotation from landmarks
          const dx = chin.x - forehead.x;
          const dy = chin.y - forehead.y;
          const dz = chin.z - forehead.z;
          const pitch = Math.atan2(dz, dy) * 0.5;
          const yaw = (nose.x - cx) * -4;
          const roll = Math.atan2(leftCheek.y - rightCheek.y, leftCheek.x - rightCheek.x);

          helmetModel.position.set(posX, posY, posZ);
          helmetModel.rotation.set(pitch, Math.PI + yaw, -roll);
          helmetModel.scale.setScalar(scale);

          tracked = true;

          if (frameCount % 15 === 0) {
            console.log(`Frame ${frameCount} [LANDMARKS]: Pos (${posX.toFixed(3)}, ${posY.toFixed(3)}, ${posZ.toFixed(3)}), Scl ${scale.toFixed(3)}, FaceW ${faceWidth.toFixed(3)}`);
          }
        }

        if (tracked) {
          // Apply smoothing
          helmetModel.position.lerp(prevPos, 0.15); // 0.15 = 85% toward prev (smoothing)
          helmetModel.quaternion.slerp(prevQuat, 0.15);
          const smoothedScl = lerp(helmetModel.scale.x, prevScl, 0.15);
          helmetModel.scale.setScalar(smoothedScl);

          // Update prev for next frame
          prevPos.copy(helmetModel.position);
          prevQuat.copy(helmetModel.quaternion);
          prevScl = helmetModel.scale.x;

          helmetModel.visible = true;

          // Update debug display
          if (frameCount % 10 === 0) {
            setDebugInfo(
              `Pos: (${helmetModel.position.x.toFixed(2)}, ${helmetModel.position.y.toFixed(2)}, ${helmetModel.position.z.toFixed(2)}) | ` +
              `Scale: ${helmetModel.scale.x.toFixed(3)} | Frame: ${frameCount}`
            );
          }
        } else {
          helmetModel.visible = false;
          if (frameCount % 30 === 0) {
            setDebugInfo('No face detected - Frame: ' + frameCount);
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
        color: '#fff',
        fontSize: 14,
        fontFamily: 'system-ui, sans-serif',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
      }}>
        {status}
      </div>

      {/* Debug panel */}
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
          AR3 v46 - Landmarks+Matrix Hybrid
        </div>
        <div>{debugInfo || 'Initializing...'}</div>
      </div>
    </main>
  );
}
