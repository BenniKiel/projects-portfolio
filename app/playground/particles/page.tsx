"use client";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ShaderMaterial } from "three";

const vertexShader = `
  uniform float uTime;
  varying vec3 vPosition;
  
  void main() {
    vec3 pos = position;
    vPosition = pos;

    pos.y += sin(uTime + pos.x * 2.0) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = 30.0 / -mvPosition.z;
  }
`;

const fragmentShader = `
  varying vec3 vPosition;

  void main() {
    gl_FragColor = vec4((vPosition.x + 5.0) * 0.1, (vPosition.y + 5.0) * 0.1, (vPosition.z + 5.0) * 0.1, 1.0);
  }
`;

const Particles = () => {
  const materialRef = useRef<ShaderMaterial>(null);
  const count = 5000; // Anzahl der Partikel

  // 1. Daten generieren (nur einmal beim Start!)
  const positions = useMemo(() => {
    // Wir brauchen 3 Werte pro Punkt (x, y, z)
    const array = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Zufällige Positionen zwischen -5 und 5
      const i3 = i * 3;
      array[i3] = (Math.random() - 0.5) * 10;     // x
      array[i3 + 1] = (Math.random() - 0.5) * 10; // y
      array[i3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    return array;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
};

export default function ParticlePage() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <Particles />
      </Canvas>
    </div>
  );
}