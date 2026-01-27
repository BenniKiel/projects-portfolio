"use client";
import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree, createPortal, extend } from "@react-three/fiber";
import * as THREE from "three";
import { GPUComputationRenderer } from "three-stdlib";
import { useFBO, useTexture } from "@react-three/drei";

const displayVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const displayFragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  // Eine coole Farb-Palette (Cosine based palette)
  // Quelle: Inigo Quilez
  vec3 palette( in float t ) {
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.263,0.416,0.557); // Spiel mit diesen Zahlen für andere Farben!
      return a + b*cos( 6.28318*(c*t+d) );
  }

  void main() {
    // Hole die Helligkeit (Dichte)
    float density = texture2D(uTexture, vUv).r;

    // Erhöhe den Kontrast etwas, damit man mehr sieht
    density = pow(density, 0.4); // Gamma correction-artig

    // Mappe Dichte auf Farbe
    vec3 color = palette(density);

    // Mische: Wenn Dichte 0 ist, soll es schwarz sein
    color *= density; 

    gl_FragColor = vec4(color, 1.0);
  }
`;

const faceVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fadeFragmentShader = `
  uniform sampler2D uTrailMap;
  uniform float uDecay;
  uniform vec2 uResolution; // WICHTIG: Muss im JS übergeben werden!
  varying vec2 vUv;

  void main() {
    // 1. Hier hat die Definition gefehlt!
    // Wir berechnen die Größe eines einzelnen Pixels (1.0 / Breite, 1.0 / Höhe)
    vec2 pixelStep = 1.0 / uResolution;

    vec4 color = texture2D(uTrailMap, vUv);
    
    // 2. Blur Berechnung (3x3 Grid)
    vec4 sum = color;
    
    // Wir nutzen jetzt 'pixelStep' statt 'step'
    sum += texture2D(uTrailMap, vUv + vec2(pixelStep.x, 0.0));   
    sum += texture2D(uTrailMap, vUv + vec2(-pixelStep.x, 0.0));  
    sum += texture2D(uTrailMap, vUv + vec2(0.0, pixelStep.y));   
    sum += texture2D(uTrailMap, vUv + vec2(0.0, -pixelStep.y));  
    
    sum += texture2D(uTrailMap, vUv + vec2(pixelStep.x, pixelStep.y));   
    sum += texture2D(uTrailMap, vUv + vec2(-pixelStep.x, pixelStep.y));  
    sum += texture2D(uTrailMap, vUv + vec2(pixelStep.x, -pixelStep.y));  
    sum += texture2D(uTrailMap, vUv + vec2(-pixelStep.x, -pixelStep.y)); 

    vec4 blurred = sum / 9.0;

    gl_FragColor = vec4(blurred.rgb * uDecay, 1.0);
  }
`;

const fragmentSimulationShader = `
  uniform float uTime;
  uniform sampler2D uTrailMap;

  const float SENSOR_ANGLE = 0.785;
  const float SENSOR_DIST = 0.5;   
  const float TURN_SPEED = 0.2;    
  const float MOVE_SPEED = 0.01;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float sense(vec2 pos, float angle) {
    vec2 sensorDir = vec2(cos(angle), sin(angle));
    vec2 sensorPos = pos + sensorDir * SENSOR_DIST;

    vec2 uv = (sensorPos + 5.0) * 0.1;
    uv = fract(uv);

    return texture2D(uTrailMap, uv).r;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);

    vec2 pos = data.xy;
    float angle = data.z;

    float weightF = sense(pos, angle);
    float weightL = sense(pos, angle + SENSOR_ANGLE);
    float weightR = sense(pos, angle - SENSOR_ANGLE);

    float randomSteer = hash(pos + uTime) * 2.0 - 1.0;

    if (weightF > weightL && weightF > weightR) {
      // Geradeaus
    } else if (weightF < weightL && weightF < weightR) {
        angle += (randomSteer - 0.5) * 2.0 * TURN_SPEED;
    }
    else if (weightL > weightR) {
        angle += randomSteer * TURN_SPEED; 
    }
    else if (weightR > weightL) {
        angle -= randomSteer * TURN_SPEED;
    }

    vec2 dir = vec2(cos(angle), sin(angle));
    pos += dir * MOVE_SPEED;

    if (pos.x > 5.0) pos.x -= 10.0;
    if (pos.x < -5.0) pos.x += 10.0;
    if (pos.y > 5.0) pos.y -= 10.0;
    if (pos.y < -5.0) pos.y += 10.0;

    gl_FragColor = vec4(pos, angle, 1.0);
  }
`;

// 2. Der Render-Shader (Vertex)
// Der holt sich die Position aus der Textur und zeigt sie an.
const renderVertexShader = `
  uniform sampler2D uPositions;
  uniform float uPointSize;
  
  void main() {
    vec3 pos = position; 

    vec4 posData = texture2D(uPositions, pos.xy);
    vec3 flatPos = vec3(posData.x / 5.0, posData.y / 5.0, 0.0);

    vec4 mvPosition = modelViewMatrix * vec4(flatPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize;
  }
`;

const renderFragmentShader = `
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, uOpacity);
  }
`;

const SimulationScene = () => {
  const { gl, size: canvasSize, viewport } = useThree();
  const simSize = 512

  const derivedSettings = useMemo(() => {
    if (simSize <= 128) return { opacity: 0.15, size: 1.8 };
    if (simSize <= 256) return { opacity: 0.05, size: 1.2 };
    
    return { opacity: 0.015, size: 1.0 }; 
  }, [simSize]);

  // --- A. INITIALISIERUNG GPGPU ---
  const gpuCompute = useMemo(() => {
    const gpu = new GPUComputationRenderer(simSize, simSize, gl);

    const dtPosition = gpu.createTexture();
    const dataArr = dtPosition.image.data as Float32Array;
    
    for (let i = 0; i < dataArr.length; i += 4) {
      dataArr[i] = (Math.random() - 0.5) * 10;
      dataArr[i + 1] = (Math.random() - 0.5) * 10;
      dataArr[i + 2] = Math.random() * Math.PI * 2;
      dataArr[i + 3] = 1;
    }

    const variable = gpu.addVariable(
      "texturePosition",
      fragmentSimulationShader,
      dtPosition
    );
    
    gpu.setVariableDependencies(variable, [variable]);

    variable.material.uniforms.uTime = { value: 0 };

    variable.material.uniforms.uTrailMap = { value: new THREE.Texture() };

    const error = gpu.init();
    if (error !== null) console.error(error);

    return { gpu, variable };
  }, [gl, simSize]);

  const trailFBO1 = useFBO(canvasSize.width, canvasSize.height, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });
  const trailFBO2 = useFBO(canvasSize.width, canvasSize.height, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });

  const trailRef = useRef({ current: trailFBO1, prev: trailFBO2 });

  const fadeScene = useMemo(() => new THREE.Scene(), []);
  const fadeMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: faceVertexShader,
    fragmentShader: fadeFragmentShader,
    uniforms: { 
      uTrailMap: { value: null }, 
      uDecay: { value: 0.95  },
      uResolution: { value: new THREE.Vector2(canvasSize.width, canvasSize.height) } 
    },
  }), [canvasSize]);

  const pointsScene = useMemo(() => new THREE.Scene(), []);
  const pointsMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: renderVertexShader,
    fragmentShader: renderFragmentShader,
    uniforms: { 
        uPositions: { value: null },
        uOpacity: { value: derivedSettings.opacity },
        uPointSize: { value: derivedSettings.size }
    },
    transparent: true,
    blending: THREE.AdditiveBlending, 
    depthWrite: false,
  }), [derivedSettings]);

  const trailCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(simSize * simSize * 3);
    for (let i = 0; i < simSize; i++) {
      for (let j = 0; j < simSize; j++) {
        const k = (i * simSize + j) * 3;
        positions[k] = j / (simSize - 1);
        positions[k + 1] = i / (simSize - 1);
        positions[k + 2] = 0; 
      }
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [simSize]);

  useFrame((state) => {
    const { gpu, variable } = gpuCompute;

    variable.material.uniforms.uTime.value = state.clock.elapsedTime;
    variable.material.uniforms.uTrailMap.value = trailRef.current.prev.texture;
    
    gpuCompute.gpu.compute();
    const currentPositions = gpu.getCurrentRenderTarget(variable).texture;

    const target = trailRef.current.current === trailFBO1 ? trailFBO2 : trailFBO1;
    const source = trailRef.current.current === trailFBO1 ? trailFBO1 : trailFBO2;

    gl.setRenderTarget(target);
    
    gl.autoClear = false;
    gl.clear();

    fadeMaterial.uniforms.uTrailMap.value = source.texture;
    gl.render(fadeScene, trailCamera);

    pointsMaterial.uniforms.uPositions.value = currentPositions;
    gl.render(pointsScene, trailCamera);
    
    gl.autoClear = true; 

    gl.setRenderTarget(null);
    trailRef.current.current = target;
    trailRef.current.prev = source;
  });

  return (
    <>
      {createPortal(
        <mesh>
            <planeGeometry args={[2, 2]} />
            <primitive object={fadeMaterial} />
        </mesh>,
        fadeScene
      )}

      {createPortal(
        <points geometry={geometry} material={pointsMaterial} />,
        pointsScene
      )}

      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shaderMaterial 
          uniforms={{ uTexture: { value: trailRef.current.prev.texture } }}
          vertexShader={displayVertexShader}
          fragmentShader={displayFragmentShader}
        />
      </mesh>
    </>
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