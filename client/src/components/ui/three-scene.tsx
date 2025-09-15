import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';

interface ThreeSceneProps {
  className?: string;
  isVisible?: boolean;
  animationState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  onInteraction?: () => void;
}

export function ThreeScene({ 
  className = "", 
  isVisible = true, 
  animationState = 'idle',
  onInteraction
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const doctorModelRef = useRef<THREE.Group>();
  const controlsRef = useRef<OrbitControls>();
  const mixerRef = useRef<THREE.AnimationMixer>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const loadingStateRef = useRef<'loading' | 'loaded' | 'error'>('loading');


  const loadDoctorModel = useCallback(async (scene: THREE.Scene) => {
    loadingStateRef.current = 'loading';
    const loader = new FBXLoader();
    
    try {
      // Load the doctor FBX model
      const doctorModel = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(
          '/src/assets/models/Doctor_1757951644903.fbx',
          (object) => resolve(object),
          undefined,
          (error) => reject(error)
        );
      });
      
      // Setup model properties
      doctorModel.scale.set(0.02, 0.02, 0.02); // Adjust scale as needed
      doctorModel.position.set(0, 0, 0);
      
      // Enable shadows for all meshes
      doctorModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Improve material properties for medical professional look
          if (child.material) {
            if (child.material instanceof THREE.MeshLambertMaterial || 
                child.material instanceof THREE.MeshPhongMaterial) {
              // Convert to PBR material for better realism
              const newMaterial = new THREE.MeshStandardMaterial({
                map: child.material.map,
                normalMap: child.material.normalMap,
                transparent: child.material.transparent,
                opacity: child.material.opacity
              });
              child.material = newMaterial;
            }
          }
        }
      });
      
      // Setup animations if available
      if (doctorModel.animations && doctorModel.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(doctorModel);
        mixerRef.current = mixer;
        
        // Add idle animation
        const idleAction = mixer.clipAction(doctorModel.animations[0]);
        idleAction.play();
      }
      
      doctorModelRef.current = doctorModel;
      scene.add(doctorModel);
      loadingStateRef.current = 'loaded';
      
    } catch (error) {
      console.error('Error loading doctor model:', error);
      loadingStateRef.current = 'error';
      
      // Fallback to professional-looking geometric doctor
      const fallbackDoctor = createFallbackDoctor();
      doctorModelRef.current = fallbackDoctor;
      scene.add(fallbackDoctor);
    }
  }, []);

  const createFallbackDoctor = useCallback(() => {
    const doctorGroup = new THREE.Group();
    
    // More professional geometric fallback
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xfdbcb4,
      roughness: 0.6,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.7, 0);
    head.castShadow = true;
    doctorGroup.add(head);

    // Professional white coat
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.45, 1.4, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.0
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.7, 0);
    body.castShadow = true;
    doctorGroup.add(body);
    
    return doctorGroup;
  }, []);

  const animateDoctor = useCallback(() => {
    if (!doctorModelRef.current) return;
    
    const time = clockRef.current.getElapsedTime();
    const model = doctorModelRef.current;
    
    switch (animationState) {
      case 'idle':
        // Gentle breathing and subtle movements
        model.rotation.y = Math.sin(time * 0.5) * 0.02;
        model.position.y = Math.sin(time * 1.5) * 0.01;
        break;
        
      case 'listening':
        // More attentive posture - lean slightly forward
        model.rotation.x = Math.sin(time * 2) * 0.01 + 0.02;
        model.rotation.y = Math.sin(time * 1) * 0.01;
        break;
        
      case 'thinking':
        // Thoughtful head movements
        model.rotation.y = Math.sin(time * 0.8) * 0.03;
        model.rotation.x = Math.sin(time * 1.2) * 0.015;
        break;
        
      case 'speaking':
        // More animated gestures during speaking
        model.rotation.y = Math.sin(time * 1.5) * 0.025;
        model.position.y = Math.sin(time * 3) * 0.015;
        model.rotation.x = Math.sin(time * 2.5) * 0.01;
        break;
    }
  }, [animationState]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // Update animation mixer
    if (mixerRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }
    
    // Update doctor animations
    animateDoctor();
    
    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, [animateDoctor]);

  useEffect(() => {
    const sceneData = initializeScene();
    if (!sceneData) return;
    
    const { scene, camera, renderer, controls, container, onMouseClick } = sceneData;
    
    // Load the doctor model
    loadDoctorModel(scene);
    
    // Start animation loop
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (camera && renderer && container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      container?.removeEventListener('click', onMouseClick);
      
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      
      if (renderer && container?.contains(renderer.domElement)) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
      
      controls?.dispose();
    };
  }, [initializeScene, loadDoctorModel, animate]);

  return (
    <div className={`${className} relative`}>
      <div 
        ref={mountRef} 
        className="w-full h-full bg-gradient-to-br from-blue-50/30 to-white rounded-lg border border-blue-100 overflow-hidden"
        style={{ minHeight: '400px' }}
        data-testid="three-scene-container"
      />
      {loadingStateRef.current === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-blue-600">Loading 3D Doctor...</p>
          </div>
        </div>
      )}
      {loadingStateRef.current === 'error' && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-xs text-yellow-800">Using fallback 3D model</p>
          </div>
        </div>
      )}
    </div>
  );
}
