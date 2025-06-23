// Simple CSS-based hyperspeed effect as fallback
import { useEffect, useRef } from "react";

interface HyperspeedProps {
  effectOptions?: {
    onSpeedUp?: () => void;
    onSlowDown?: () => void;
    distortion?: string;
    speed?: number;
    particleCount?: number;
    particleSize?: number;
    color?: string;
  };
  isActive?: boolean;
}

export function Hyperspeed({ effectOptions, isActive = true }: HyperspeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const particleCount = effectOptions?.particleCount || 100;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hyperspeed-particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: ${Math.random() * 20 + 10}px;
        background: ${effectOptions?.color || '#00ff88'};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.8 + 0.2};
        animation: hyperspeed ${Math.random() * 2 + 1}s linear infinite;
        box-shadow: 0 0 6px ${effectOptions?.color || '#00ff88'};
      `;
      container.appendChild(particle);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes hyperspeed {
        from {
          transform: translateY(100vh) scaleY(1);
        }
        to {
          transform: translateY(-100vh) scaleY(3);
        }
      }
      .hyperspeed-particle {
        filter: blur(0.5px);
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      const particles = container.querySelectorAll('.hyperspeed-particle');
      particles.forEach(particle => particle.remove());
      style.remove();
    };
  }, [isActive, effectOptions]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
        overflow: 'hidden'
      }}
    />
  );
}

export default Hyperspeed;