import { useEffect, useRef } from 'react';

export function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    // Clear existing chars
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
      const char = document.createElement('div');
      char.className = 'absolute text-green-500 font-mono text-sm animate-pulse';
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      char.style.left = Math.random() * 100 + '%';
      char.style.animationDelay = Math.random() * 20 + 's';
      char.style.animationDuration = (Math.random() * 10 + 10) + 's';
      
      // Add falling animation
      char.style.transform = `translateY(-100vh)`;
      char.style.animation = `matrix-fall ${Math.random() * 10 + 10}s linear infinite`;
      
      container.appendChild(char);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes matrix-fall {
        0% { transform: translateY(-100vh); opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-10"
    />
  );
}
