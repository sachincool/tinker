"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, Zap, Code2, Rocket, Server, Database } from "lucide-react";

export default function InteractiveCube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const cube = cubeRef.current;
    if (!container || !cube) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate mouse position relative to center (-1 to 1)
      mouseX = (e.clientX - centerX) / (rect.width / 2);
      mouseY = (e.clientY - centerY) / (rect.height / 2);

      // Convert to rotation angles (max 30 degrees)
      targetRotateY = mouseX * 30;
      targetRotateX = -mouseY * 30;
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      targetRotateX = 0;
      targetRotateY = 0;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    // Smooth animation loop
    const animate = () => {
      // Smooth interpolation (lerp)
      currentRotateX += (targetRotateX - currentRotateX) * 0.1;
      currentRotateY += (targetRotateY - currentRotateY) * 0.1;

      cube.style.transform = `
        rotateX(${currentRotateX}deg) 
        rotateY(${currentRotateY}deg)
      `;

      requestAnimationFrame(animate);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);
    
    const animationId = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const faces = [
    { 
      id: "front", 
      icon: Terminal, 
      label: "SRE", 
      gradient: "from-blue-500 to-cyan-500",
      transform: "rotateY(0deg) translateZ(100px)"
    },
    { 
      id: "back", 
      icon: Server, 
      label: "DevOps", 
      gradient: "from-purple-500 to-pink-500",
      transform: "rotateY(180deg) translateZ(100px)"
    },
    { 
      id: "right", 
      icon: Code2, 
      label: "K8s", 
      gradient: "from-green-500 to-emerald-500",
      transform: "rotateY(90deg) translateZ(100px)"
    },
    { 
      id: "left", 
      icon: Database, 
      label: "Cloud", 
      gradient: "from-orange-500 to-red-500",
      transform: "rotateY(-90deg) translateZ(100px)"
    },
    { 
      id: "top", 
      icon: Rocket, 
      label: "Deploy", 
      gradient: "from-indigo-500 to-blue-500",
      transform: "rotateX(90deg) translateZ(100px)"
    },
    { 
      id: "bottom", 
      icon: Zap, 
      label: "Chaos", 
      gradient: "from-yellow-500 to-orange-500",
      transform: "rotateX(-90deg) translateZ(100px)"
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] flex items-center justify-center perspective-[1000px] cursor-pointer select-none"
    >
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-60"
        }`}
      >
        <div className="w-[300px] h-[300px] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Cube container */}
      <div
        ref={cubeRef}
        className="relative preserve-3d transition-transform duration-100 ease-out"
        style={{
          width: "200px",
          height: "200px",
          transformStyle: "preserve-3d",
        }}
      >
        {faces.map((face) => {
          const Icon = face.icon;
          return (
            <div
              key={face.id}
              className={`
                absolute w-full h-full
                flex flex-col items-center justify-center gap-3
                bg-gradient-to-br ${face.gradient}
                border border-white/20
                backdrop-blur-sm
                shadow-2xl
                transition-all duration-300
                ${isHovered ? "opacity-90" : "opacity-80"}
              `}
              style={{
                transform: face.transform,
                backfaceVisibility: "visible",
              }}
            >
              <Icon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={2.5} />
              <span className="text-white font-bold text-xl tracking-wider drop-shadow-lg">
                {face.label}
              </span>
              
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none"></div>
              
              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
            </div>
          );
        })}

        {/* Edge highlights for depth */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle edge glow */}
          <div className="absolute inset-0 shadow-[0_0_60px_rgba(139,92,246,0.5)]"></div>
        </div>
      </div>

      {/* Hint text */}
      <div className="absolute bottom-8 text-center">
        <p className={`text-sm text-muted-foreground transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}>
          Hover to explore
        </p>
      </div>
    </div>
  );
}

