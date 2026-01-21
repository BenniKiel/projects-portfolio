"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

const RotatingCube = () => {
  const meshRef = useRef<Mesh>(null);

  const [color, setColor] = React.useState("orange");
  const [clicked, setClicked] = React.useState(false);

  const handlePointerOver = (event: React.PointerEvent) => {
    setColor("red");
  }

  const handlePointerOut = (event: React.PointerEvent) => {
    setColor("orange");
  }

  const handleClick = (event: React.MouseEvent) => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;

      const targetScale = clicked ? 1.5 : 1;
      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
    
  });

  return (
    <mesh 
      ref={meshRef}

      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default function CubePage() {
  return (
    <div className="w-full h-full bg-neutral-900">
      {/* Der Canvas ist das Fenster in die 3D-Welt. 
          Er ersetzt das manuelle Erstellen von Scene, Camera und Renderer. */}
      <Canvas>
        {/* Lichter sind essenziell für meshStandardMaterial */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <RotatingCube />
      </Canvas>
    </div>
  );
}