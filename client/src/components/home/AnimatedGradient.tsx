import { useEffect, useRef } from 'react';

export function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Create gradient points
    const gradientPoints = [
      { x: width * 0.1, y: height * 0.2, radius: 300, color: '#4F46E550' },
      { x: width * 0.7, y: height * 0.4, radius: 250, color: '#06B6D450' },
      { x: width * 0.5, y: height * 0.7, radius: 200, color: '#3B82F650' }
    ];
    
    // Animation variables
    const speeds = gradientPoints.map(() => ({
      x: Math.random() * 0.5 - 0.25,
      y: Math.random() * 0.5 - 0.25
    }));
    
    const boundaries = {
      xMin: 0,
      xMax: width,
      yMin: 0,
      yMax: height
    };
    
    function drawGradients() {
      // Safely check if context still exists (in case component unmounts)
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      
      gradientPoints.forEach((point, index) => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        
        gradient.addColorStop(0, point.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position for next frame
        point.x += speeds[index].x;
        point.y += speeds[index].y;
        
        // Bounce off boundaries
        if (point.x - point.radius < boundaries.xMin || point.x + point.radius > boundaries.xMax) {
          speeds[index].x *= -1;
        }
        
        if (point.y - point.radius < boundaries.yMin || point.y + point.radius > boundaries.yMax) {
          speeds[index].y *= -1;
        }
      });
      
      requestAnimationFrame(drawGradients);
    }
    
    const handleResize = () => {
      if (!canvas) return;
      
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Reset gradient points on resize
      gradientPoints[0] = { x: width * 0.1, y: height * 0.2, radius: 300, color: '#4F46E550' };
      gradientPoints[1] = { x: width * 0.7, y: height * 0.4, radius: 250, color: '#06B6D450' };
      gradientPoints[2] = { x: width * 0.5, y: height * 0.7, radius: 200, color: '#3B82F650' };
      
      boundaries.xMax = width;
      boundaries.yMax = height;
    };
    
    window.addEventListener('resize', handleResize);
    drawGradients();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 -z-10 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}