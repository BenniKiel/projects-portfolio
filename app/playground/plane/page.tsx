"use client";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Material, ShaderMaterial } from "three";
import Particles from "@/components/particles";
import ParticlePage from "@/components/particles";
import SlimePage from "@/components/slime-simulation";

const vertexShader = `
  varying vec2 vUv; 

  void main() {
    vUv = uv; // Wir speichern die UV-Koordinaten (0,0 bis 1,1) um sie dem Fragment Shader zu geben
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv; // Die Koordinaten vom Vertex Shader kommen hier an

  void main() {
    float overEdge = step(mod(uTime, 1.0), vUv.x);
    vec3 color = vec3(1.0 - overEdge, 0.0, overEdge); // R, G, B
    
    gl_FragColor = vec4(color, 1.0); // A (Alpha) ist 1.0 (sichtbar)
  }
`;

const ShaderPlane = () => {

  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * 0.5;
    }
    
  });

  return (
    <mesh>
      {/* Eine flache Ebene, 4x4 Einheiten groß */}
      <planeGeometry args={[4, 4]} />
      
      {/* Das Herzstück: shaderMaterial */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default function ShaderPage() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas>
        <ShaderPlane />
      </Canvas>
    </div>
  );
}