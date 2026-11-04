import React, { useRef, useEffect } from 'react';

/**
 * Interactive canvas with soft stylized floating café objects
 * (steaming cup, ceramic serving plate, fresh herb leaves, warm spice grains).
 * Uses smooth requestAnimationFrame with mouse parallax and gentle floating oscillation.
 */
export const Hero3DCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 fps budget for smooth, lossless CPU execution

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      time += 0.03;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x * 35;
      const my = mouseRef.current.y * 35;

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Warm ambient halo glow behind 3D elements
      const gradient = ctx.createRadialGradient(
        centerX + mx * 0.5,
        centerY + my * 0.5,
        20,
        centerX,
        centerY,
        width * 0.55
      );
      gradient.addColorStop(0, 'rgba(235, 172, 133, 0.28)');
      gradient.addColorStop(0.5, 'rgba(244, 222, 190, 0.18)');
      gradient.addColorStop(1, 'rgba(250, 247, 242, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Base Ceramic Platter (3D perspective disc with layered rim)
      const plateY = centerY + 30 + Math.sin(time * 0.9) * 6 + my * 0.8;
      const plateX = centerX + mx * 0.8;

      // Soft ground contact shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(plateX, plateY + 60, 110, 35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 53, 40, 0.07)';
      ctx.fill();
      ctx.restore();

      // Outer Ceramic Rim
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(plateX, plateY, 95, 42, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#E8DFD5';
      ctx.fill();

      // Plate Inner Surface
      ctx.beginPath();
      ctx.ellipse(plateX, plateY - 4, 82, 34, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#F5EFE9';
      ctx.fill();

      // Terracotta rim line
      ctx.beginPath();
      ctx.ellipse(plateX, plateY - 4, 82, 34, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#D9825F';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 3. Floating Artisanal Cup (Terracotta Kulhad with Chai/Coffee)
      const cupFloat = Math.cos(time * 1.2) * 9;
      const cupX = plateX - 25 + mx * 0.3;
      const cupY = plateY - 45 + cupFloat + my * 0.3;

      // Cup shadow on plate
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cupX, plateY - 4, 24, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 53, 40, 0.15)';
      ctx.fill();
      ctx.restore();

      // Cup Body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cupX - 20, cupY);
      ctx.lineTo(cupX + 20, cupY);
      ctx.lineTo(cupX + 15, cupY + 36);
      ctx.lineTo(cupX - 15, cupY + 36);
      ctx.closePath();
      const cupGrad = ctx.createLinearGradient(cupX - 20, cupY, cupX + 20, cupY);
      cupGrad.addColorStop(0, '#C85A32');
      cupGrad.addColorStop(0.4, '#E07A5F');
      cupGrad.addColorStop(1, '#A04321');
      ctx.fillStyle = cupGrad;
      ctx.fill();

      // Cup Top Opening
      ctx.beginPath();
      ctx.ellipse(cupX, cupY, 20, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#653E2A';
      ctx.fill();
      ctx.strokeStyle = '#FAF7F2';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Steaming Vapor spirals
      const steamY1 = cupY - 14 - ((time * 25) % 35);
      const steamAlpha1 = Math.max(0, 1 - ((time * 25) % 35) / 35);
      ctx.beginPath();
      ctx.arc(cupX - 4 + Math.sin(time * 2) * 5, steamY1, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${steamAlpha1 * 0.4})`;
      ctx.fill();

      const steamY2 = cupY - 18 - (((time + 1) * 25) % 35);
      const steamAlpha2 = Math.max(0, 1 - (((time + 1) * 25) % 35) / 35);
      ctx.beginPath();
      ctx.arc(cupX + 6 + Math.cos(time * 2.2) * 4, steamY2, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${steamAlpha2 * 0.35})`;
      ctx.fill();
      ctx.restore();

      // 4. Floating Fresh Mint / Coriander Leaf
      const leafTime = time * 1.4;
      const leafX = plateX + 45 + Math.sin(leafTime) * 12 + mx * 1.2;
      const leafY = plateY - 30 + Math.cos(leafTime) * 10 + my * 1.2;

      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(Math.sin(time) * 0.25 + 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#7E9A82';
      ctx.fill();

      // Leaf central vein
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.strokeStyle = '#5E7A63';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 5. Small floating star anise spice
      const aniseX = plateX + 35 + mx * 0.5;
      const aniseY = plateY + 10 + Math.sin(time * 1.1) * 5 + my * 0.5;
      ctx.save();
      ctx.translate(aniseX, aniseY);
      ctx.rotate(time * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#70422A';
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 7, Math.sin(angle) * 7, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#5A321E';
        ctx.fill();
      }
      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
