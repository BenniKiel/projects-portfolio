"use client";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, createPortal, extend } from "@react-three/fiber";
import * as THREE from "three";
import { useFBO, useTexture } from "@react-three/drei";

const echoVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const echoFragmentShader = `
    uniform sampler2D uSourceTexture;
    uniform float uZoom;
    varying vec2 vUv;

    void main() {
        vec2 uv = vUv - 0.5;
        uv *= uZoom; 

        float angle = 0.05; // Kleine Drehung pro Frame
        float s = sin(angle);
        float c = cos(angle);

        uv = mat2(c, -s, s, c) * uv;
        uv += 0.5;

        vec4 color = texture2D(uSourceTexture, uv);
        gl_FragColor = vec4(color.rgb * 0.99, 1.0);
    }
`;

const displayFragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = color;
    }
`;

const SimulationScene = () => {
    const { gl, size, viewport} = useThree();
    const aspectRatio = size.width / size.height;

    const echoFBO1 = useFBO(size.width, size.height);
    const echoFBO2 = useFBO(size.width, size.height);

    const bufferRef = useRef({ write: echoFBO1, read: echoFBO2 });
    const boxRef = useRef<THREE.Mesh>(null!);

    const offScreenScene = useMemo(() => new THREE.Scene(), []);
    const offScreenCamera = useMemo(() => 
        new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 10), 
    [aspectRatio]);
    offScreenCamera.position.z = 5;

    const echoMaterial = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: echoVertexShader,
        fragmentShader: echoFragmentShader,
        uniforms: { uSourceTexture: { value: null }, uZoom: { value: 0.98 } },
        depthTest: false,
    }), []);

    const screenMaterial = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: echoVertexShader,
        fragmentShader: displayFragmentShader,
        uniforms: { uTexture: { value: null } }
    }), []);

    useFrame((state, delta) => {

        if (boxRef.current) {
            boxRef.current.rotation.x += delta;
            boxRef.current.rotation.y += delta * 0.5;
        }

        const writeBuffer = bufferRef.current.write;
        const readBuffer = bufferRef.current.read;

        echoMaterial.uniforms.uSourceTexture.value = readBuffer.texture;

        gl.setRenderTarget(writeBuffer);
        gl.render(offScreenScene, offScreenCamera);

        gl.setRenderTarget(null);

        screenMaterial.uniforms.uTexture.value = writeBuffer.texture;

        const temp = bufferRef.current.write;
        bufferRef.current.write = bufferRef.current.read;
        bufferRef.current.read = temp;
        
    });

    return (
        <>
            {createPortal(
                <>
                    <mesh position={[0, 0, -1]}>
                        <planeGeometry args={[2, 2]} />
                        <primitive object={echoMaterial} attach="material" />
                    </mesh>
                    <mesh ref={boxRef}>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshNormalMaterial />
                    </mesh>
                </>,
                offScreenScene
            )}
            <mesh>
                 <planeGeometry args={[viewport.width, viewport.height]} /> 
                 <primitive object={screenMaterial} attach="material" />
            </mesh>
        </>
    )
}

export default function InfinityEchoPage() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <SimulationScene />
      </Canvas>
    </div>
  );
}