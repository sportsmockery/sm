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
  const [approach, setApproach] = useState<'A' | 'B'>('A'); // Toggle between approaches

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

    // Get approach from URL param
    const urlParams = new URLSearchParams(window.location.search);
    const testApproach = urlParams.get('approach') || 'A';

    const init = async () => {
      console.log('========== AR3 v47 DIAGNOSTIC TEST ==========');
      console.log('Testing Approach:', testApproach);
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

        // Process materials - FORCE visibility
        let meshCount = 0;
        loadedHelmet.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
            meshCount++;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              console.log(`Mesh ${meshCount}: ${mesh.name}, Material type: ${mat.type}`);

              if (mat.isMeshStandardMaterial) {
                // Force non-metallic and visible
                mat.metalness = 0.1;
                mat.roughness = 0.8;
                mat.envMapIntensity = 0.5;
                // Add slight emissive to guarantee visibility
                mat.emissive = new THREE.Color(0x222222);
                mat.emissiveIntensity = 0.3;
                mat.needsUpdate = true;
                console.log(`  → metalness: ${mat.metalness}, roughness: ${mat.roughness}, emissive: yes`);
              }
            }
          }
        });
        console.log('Total meshes processed:', meshCount);

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

      setStatus(`Ready! Approach ${testApproach} - Look at camera`);
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
          // APPROACH A: LANDMARK-BASED (Perplexity style)
          // ========================================
          if (testApproach === 'A') {
            // Key landmarks
            const foreheadCenter = lm[10]; // Top of forehead
            const noseBridge = lm[6]; // Between eyes
            const leftTemple = lm[234];
            const rightTemple = lm[454];
            const chin = lm[152];

            // Log raw landmarks every 30 frames
            if (frameCount % 30 === 1) {
              console.log('=== APPROACH A: LANDMARK DEBUG (Frame ' + frameCount + ') ===');
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

            // Position: Slightly above forehead center
            const posX = foreheadPos.x;
            const posY = foreheadPos.y + faceHeight * 0.1; // 10% above forehead
            const posZ = foreheadPos.z - 0.1;

            // Scale based on face width
            // Face width ~0.25-0.35 in ortho units when face fills frame
            // Helmet model is ~0.2m, we want it to cover the head
            const targetScale = faceWidth * 4; // Adjust multiplier as needed
            const uniformScl = Math.max(0.8, Math.min(2.0, targetScale));

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

          // ========================================
          // APPROACH B: MATRIX-BASED
          // ========================================
          else if (testApproach === 'B') {
            if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
              const matrixData = results.facialTransformationMatrixes[0].data;

              if (frameCount % 30 === 1) {
                console.log('=== APPROACH B: MATRIX DEBUG (Frame ' + frameCount + ') ===');
                console.log('Raw matrix (16 floats):', Array.from(matrixData).map(v => v.toFixed(4)));
              }

              // MediaPipe matrix is row-major, Three.js is column-major
              // Row-major layout: [r0c0, r0c1, r0c2, r0c3, r1c0, ...]
              // Translation is at indices 3, 7, 11 in row-major (last column)
              // OR indices 12, 13, 14 if it's already column-major

              // Try extracting translation from both possible locations
              const trans_rowmajor = [matrixData[3], matrixData[7], matrixData[11]];
              const trans_colmajor = [matrixData[12], matrixData[13], matrixData[14]];

              if (frameCount % 30 === 1) {
                console.log('Translation (row-major indices 3,7,11):', trans_rowmajor.map(v => v.toFixed(4)));
                console.log('Translation (col-major indices 12,13,14):', trans_colmajor.map(v => v.toFixed(4)));
              }

              // Build Three.js matrix (expects column-major)
              const faceMatrix = new THREE.Matrix4().fromArray(matrixData);

              if (frameCount % 30 === 1) {
                console.log('Matrix after fromArray:', faceMatrix.elements.map(v => v.toFixed(4)));
              }

              // Transpose if needed (row-major to column-major)
              faceMatrix.transpose();

              if (frameCount % 30 === 1) {
                console.log('Matrix after transpose:', faceMatrix.elements.map(v => v.toFixed(4)));
              }

              // Decompose
              const position = new THREE.Vector3();
              const quaternion = new THREE.Quaternion();
              const scaleVec = new THREE.Vector3();
              faceMatrix.decompose(position, quaternion, scaleVec);

              if (frameCount % 30 === 1) {
                console.log('Decomposed position:', position.toArray().map(v => v.toFixed(4)));
                console.log('Decomposed quaternion:', quaternion.toArray().map(v => v.toFixed(4)));
                console.log('Decomposed scale:', scaleVec.toArray().map(v => v.toFixed(4)));
              }

              // The matrix translation is in centimeters, convert to our ortho space
              // Our ortho camera spans ~1 unit vertically, video is ~30cm face
              // So 1cm ≈ 0.033 units, or translation / 30

              // Use landmarks for position (more reliable)
              const nose = lm[1];
              const forehead = lm[10];
              const leftCheek = lm[454];
              const rightCheek = lm[234];

              const posX = -(nose.x - 0.5) * videoAspect;
              const posY = -(forehead.y - 0.5) + 0.05; // Offset above forehead
              const posZ = -0.5;

              const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
              const uniformScl = Math.max(0.8, Math.min(2.0, faceWidth * 6));

              // Apply coordinate transforms to rotation
              // MediaPipe: +X right, +Y down, +Z toward camera
              // Three.js: +X right, +Y up, +Z toward camera
              const coordConvert = new THREE.Matrix4().makeScale(1, -1, -1);
              const rotMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
              rotMatrix.premultiply(coordConvert);

              // Mirror for selfie
              const mirrorMatrix = new THREE.Matrix4().makeScale(-1, 1, 1);
              rotMatrix.multiply(mirrorMatrix);

              const finalQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

              // 180° Y flip for facemask forward
              const flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
              finalQuat.premultiply(flipY);

              if (frameCount % 30 === 1) {
                console.log('--- Final Values ---');
                console.log('Final position:', { x: posX.toFixed(4), y: posY.toFixed(4), z: posZ.toFixed(4) });
                console.log('Final scale:', uniformScl.toFixed(4));
                console.log('Final quaternion:', finalQuat.toArray().map(v => v.toFixed(4)));
              }

              helmetModel.position.set(posX, posY, posZ);
              helmetModel.quaternion.copy(finalQuat);
              helmetModel.scale.setScalar(uniformScl);

              tracked = true;
            } else {
              if (frameCount % 60 === 1) {
                console.log('No transformation matrix available this frame');
              }
            }
          }
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
              `Approach ${testApproach} | ` +
              `Pos: (${helmetModel.position.x.toFixed(3)}, ${helmetModel.position.y.toFixed(3)}, ${helmetModel.position.z.toFixed(3)}) | ` +
              `Scale: ${helmetModel.scale.x.toFixed(3)} | Frame: ${frameCount}`
            );
          }
        } else if (helmetModel) {
          helmetModel.visible = false;
          if (frameCount % 30 === 0) {
            setDebugInfo(`Approach ${testApproach} | No face detected - Frame: ${frameCount}`);
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

      {/* Approach selector buttons */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        gap: 10,
        zIndex: 30,
      }}>
        <a
          href="?approach=A"
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 5,
            fontFamily: 'system-ui',
            fontWeight: 'bold',
          }}
        >
          Test A: Landmarks
        </a>
        <a
          href="?approach=B"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 5,
            fontFamily: 'system-ui',
            fontWeight: 'bold',
          }}
        >
          Test B: Matrix
        </a>
      </div>

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
        backgroundColor: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontSize: 12,
        fontFamily: 'monospace',
        borderRadius: 5,
        zIndex: 20,
        maxWidth: '60%',
      }}>
        <div style={{ marginBottom: 5, color: '#ff0', fontWeight: 'bold' }}>
          AR3 v47 - DIAGNOSTIC TEST
        </div>
        <div style={{ marginBottom: 5, color: '#0ff' }}>
          Open browser console (F12) for detailed logs
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        fontSize: 13,
        fontFamily: 'system-ui',
        borderRadius: 5,
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '90%',
      }}>
        Click buttons above to switch approaches. Check browser console (F12) for diagnostic values.
      </div>
    </main>
  );
}
