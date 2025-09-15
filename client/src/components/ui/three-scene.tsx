import { useEffect, useRef } from 'react';

interface ThreeSceneProps {
  className?: string;
  isVisible?: boolean;
}

export function ThreeScene({ className = "", isVisible = true }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isVisible || !mountRef.current) return;

    // Simple 3D doctor avatar simulation
    const container = mountRef.current;
    
    // Create doctor avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'relative w-full h-full flex items-center justify-center';
    
    // Doctor avatar with simple CSS animation
    const avatar = document.createElement('div');
    avatar.className = 'w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transform transition-all duration-1000';
    avatar.innerHTML = '<i class="fas fa-user-md"></i>';
    
    // Floating animation
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const y = Math.sin(elapsed * 0.003) * 10;
      const rotation = Math.sin(elapsed * 0.002) * 5;
      
      avatar.style.transform = `translateY(${y}px) rotateY(${rotation}deg)`;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    avatarContainer.appendChild(avatar);
    container.appendChild(avatarContainer);
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (container && avatarContainer) {
        container.removeChild(avatarContainer);
      }
    };
  }, [isVisible]);

  return (
    <div 
      ref={mountRef} 
      className={`${className} bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg`}
      style={{ width: '100%', height: '200px' }}
    />
  );
}
