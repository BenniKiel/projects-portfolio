"use client";
import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { GPUComputationRenderer } from "three-stdlib";

// 1. Der Simulations-Shader (GPGPU)
// Dieser Shader läuft NICHT auf dem Screen. Er berechnet nur Daten.
// "gl_FragColor" speichert hier die NEUE Position des Partikels.
const fragmentSimulationShader = `
  void main() {
    // gl_FragCoord gibt uns die x/y Koordinate des Pixels in der Textur.
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Wir lesen die AKTUELLE Position aus der "alten" Textur
    // (texture2D ist standard GLSL)
    // texturePosition ist eine Variable, die GPUComputationRenderer uns gibt.
    vec4 tmpPos = texture2D(texturePosition, uv);
    vec3 position = tmpPos.xyz;

    // --- BEWEGUNG ---
    // Zum Testen: Bewege alle Partikel langsam nach rechts
    position.x += 0.01;

    // Reset wenn zu weit rechts (Loop)
    if (position.x > 5.0) position.x = -5.0;

    // Schreibe die neue Position in den Speicher (Textur)
    gl_FragColor = vec4(position, 1.0);
  }
`;

// 2. Der Render-Shader (Vertex)
// Der holt sich die Position aus der Textur und zeigt sie an.
const renderVertexShader = `
  uniform sampler2D uPositions; // Die Textur mit den Daten
  
  void main() {
    // Wir missbrauchen "position", um die UV-Koordinaten zu speichern
    // (Da wir Partikel als Textur speichern, ist der Index = UV)
    vec3 pos = position; 
    
    // Lese die ECHTE Position aus der Textur
    vec4 posData = texture2D(uPositions, pos.xy); // pos.xy sind hier unsere IDs (0.0 bis 1.0)
    
    vec4 mvPosition = modelViewMatrix * vec4(posData.xyz, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 2.0;
  }
`;

const renderFragmentShader = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

const SimulationScene = () => {
  const { gl } = useThree();
  const size = 128; // Texturgröße: 128x128 = 16.384 Partikel

  // --- A. INITIALISIERUNG GPGPU ---
  const gpuCompute = useMemo(() => {
    const gpu = new GPUComputationRenderer(size, size, gl);

    // 1. Start-Daten erstellen
    const dtPosition = gpu.createTexture();
    const dataArr = dtPosition.image.data as Float32Array;
    
    for (let i = 0; i < dataArr.length; i += 4) {
      // x, y, z zufällig verteilen (-5 bis 5)
      dataArr[i] = (Math.random() - 0.5) * 10;     // x
      dataArr[i + 1] = (Math.random() - 0.5) * 10; // y
      dataArr[i + 2] = 0;                          // z (2D Simulation erst mal)
      dataArr[i + 3] = 1;                          // alpha (egal)
    }

    // 2. Variable hinzufügen ("texturePosition" ist der Name im Shader)
    const variable = gpu.addVariable(
      "texturePosition",
      fragmentSimulationShader,
      dtPosition
    );
    
    // Dependencies setzen (der Shader braucht seine eigenen alten Daten)
    gpu.setVariableDependencies(variable, [variable]);

    // Initialisieren
    const error = gpu.init();
    if (error !== null) console.error(error);

    return { gpu, variable };
  }, [gl]);

  // --- B. VISUALISIERUNG ---
  // Wir brauchen eine Geometrie, die für jeden Partikel einen "Anker" hat
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(size * size * 3);
    
    // Trick: Wir speichern die "Adresse" (UV) des Partikels in der Textur
    // statt seiner 3D-Position. Der Vertex-Shader schlägt dann nach.
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const k = (i * size + j) * 3;
        positions[k] = j / (size - 1); // u (0..1)
        positions[k + 1] = i / (size - 1); // v (0..1)
        positions[k + 2] = 0; 
      }
    }
    
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    // 1. Berechne Physik (GPGPU)
    gpuCompute.gpu.compute();

    // 2. Hole das Ergebnis (die Textur mit den neuen Positionen)
    const target = gpuCompute.gpu.getCurrentRenderTarget(gpuCompute.variable);
    
    // 3. Übergib die Textur an das Render-Material
    if (materialRef.current) {
      materialRef.current.uniforms.uPositions.value = target.texture;
    }
  });

  return (
    <points geometry={particles}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={renderVertexShader}
        fragmentShader={renderFragmentShader}
        uniforms={{
          uPositions: { value: null } // Wird im Loop gefüllt
        }}
      />
    </points>
  );
};

export default function SlimePage() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <SimulationScene />
      </Canvas>
    </div>
  );
}