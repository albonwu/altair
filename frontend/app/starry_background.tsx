"use client";
import { useEffect, useRef, useState } from "react";

const StarryBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stars: any[] = [];
    let prevMouse = { x: 0, y: 0};
    let shift = { x: 0, y: 0 };
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
      if (typeof window === "undefined") return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      const numStars = 300;
  
      if (!ctx) return;
  
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      // Create Star Object
      class Star {
        x: number;
        y: number;
        radius: number;
  
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.radius = Math.random() * 2;
        }
  
        draw() {
          ctx.beginPath();
          ctx.arc(this.x + shift.x, this.y + shift.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fill();
        }
      }
  
      // Initialize Stars
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
      }
  
      // Animate Stars
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach((star) => star.draw());
        requestAnimationFrame(animate);
      };
      animate();
  
      // Handle Mouse Movement
      const onMouseMove = (event: MouseEvent) => {
        const dx = event.clientX - prevMouse.x;
        const dy = event.clientY - prevMouse.y;
  
        shift.x = dx * 0.1; // Small shift for smooth effect
        shift.y = dy * 0.1;
  
        prevMouse.x = event.clientX;
        prevMouse.y = event.clientY;
      };
      window.addEventListener("mousemove", onMouseMove);
  
      // Handle Window Resize
      const onResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener("resize", onResize);
  
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
      };
    }, []);
  
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" />;
  };
  

export default StarryBackground;
