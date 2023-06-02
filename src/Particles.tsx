/* eslint-disable @typescript-eslint/no-namespace */
import { useState, useEffect, useRef } from "react";
import { Particles, initializeParticlesInBox, buildParticlePosMap } from "./particles/particles";

import * as THREE from 'three';
import SceneInit from './SceneInit';
import { ReactThreeFiber, extend, useFrame, Canvas } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

import p_frag from './p_fragment.glsl';
import p_vert from './p_vertex.glsl';

const size = 0.2;
const numParticles = 8;
const cubeSideLength = 4;
const halfDims = new THREE.Vector3(cubeSideLength / 2, cubeSideLength / 2, cubeSideLength / 2)

export default function ParticleDisplay(): JSX.Element {
    const pos = new THREE.Vector3(
        0, 0, -2
    );
    const rot = new THREE.Matrix4();
    rot.makeRotationAxis(pos, 0);

    const [particles, setParticles] = useState<Particles>(initializeParticlesInBox(
        halfDims, 
        numParticles, 
        size,
    ));

    useEffect(() => {
        console.log(particles);
    }, [particles])

	const Shader = (props: {
        width: number, 
        height: number, 
        pos: THREE.Vector3, 
        rot: THREE.Matrix4,
    }) => {
		const meshRef = useRef<any>();
        const {height, width, pos, rot} = props;
        const [time, setTime] = useState(0);

        const {xTex, yTex, zTex} = buildParticlePosMap(particles, pos, halfDims);
        console.log(xTex);
        console.log(yTex);
        console.log(zTex);

        const uniforms = {
            u_resolution: {
                type: 'v2',
                value: new THREE.Vector2(
                    width,
                    height
                )
            },
            u_time: {
                value: time,
            },
            u_cube_pos: {
                type: 'v3',
                value: pos
            },
            u_cube_rot: {
                value: rot
            },
            u_cube_dims: {
                value: new THREE.Vector3(
                    particles.dim, 
                    particles.dim,
                    particles.dim
                )
            },
            u_particles_x: {
                value: xTex
            },
            u_particles_y: {
                value: yTex
            },
            u_particles_z: {
                value: zTex
            },
            u_particle_size: {
                value: particles.size
            },
            u_half_dims: {
                value: halfDims
            },
            u_num_particles: {
                value: numParticles
            }
        };

        if (!meshRef) return <></>;
		return (
			<mesh ref={meshRef}>
				<boxGeometry args={[2, 2, 2]} />
				<shaderMaterial 
                    uniforms={uniforms}
                    vertexShader={p_vert}
                    fragmentShader={p_frag} />
			</mesh>
		);
	};

    return <Canvas style={{width: '50vw', height: '50vh'}}>
        <Shader 
            width={2*window.innerWidth} 
            height={2*window.innerHeight}
            pos={pos}
            rot={rot}
        />
    </Canvas>
}