
import React, { useEffect, useRef } from 'react';

interface WaveCanvasProps {
  volumeRef: React.MutableRefObject<number>;
  isActive: boolean;
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ volumeRef, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tick = 0;
    let currentVolume = 0;

    // Gemini-inspired gradient colors
    const lines = [
      { color: '#4285F4', phase: 0, speed: 0.02, amplitude: 1.0 }, // Blue
      { color: '#DB4437', phase: 2, speed: 0.03, amplitude: 0.8 }, // Red
      { color: '#A142F4', phase: 4, speed: 0.015, amplitude: 1.2 }, // Purple
    ];

    const render = () => {
      if (canvas.width !== container.offsetWidth || canvas.height !== container.offsetHeight) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height * 0.6; // Move slightly down

      ctx.clearRect(0, 0, width, height);

      // Smooth volume interpolation
      const targetVolume = isActive ? Math.max(0.1, volumeRef.current) : 0.05; // Keep a tiny bit of movement even when idle
      currentVolume += (targetVolume - currentVolume) * 0.15;

      // Additive blending for "Glowing" effect
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 4;

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;

        // Create a gradient for the stroke to fade out at edges
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.2, line.color);
        gradient.addColorStop(0.8, line.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = gradient;

        // Shadow for glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = line.color;

        for (let x = 0; x < width; x++) {
          // Normalized x (-1 to 1) for envelope shaping
          const nx = (x / width) * 2 - 1;
          // Window function (Hanning-like) to taper ends
          const envelope = 1 - Math.pow(nx, 2);

          // Wave calculation
          const wave1 = Math.sin(x * 0.01 + tick * line.speed + line.phase);
          const wave2 = Math.sin(x * 0.02 - tick * (line.speed * 0.5) + line.phase * 2);

          // Combine waves
          const y = centerY + (wave1 + wave2) * envelope * (currentVolume * 100 * line.amplitude);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Restore context
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;

      tick++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isActive, volumeRef]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default WaveCanvas;
