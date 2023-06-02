/* eslint-disable @typescript-eslint/no-namespace */
import { useState, useEffect, useRef } from "react";

import * as THREE from 'three';
import SceneInit from './SceneInit';
import { ReactThreeFiber, extend, useFrame, Canvas, invalidate } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

import p_frag from './fragment.glsl';
import p_vert from './vertex.glsl';

import earthOrbitNorth from './assets/Orbit_north.jpeg';
import earthOrbitSouth from './assets/Orbit_south.jpeg';
import earthOrbitEast from './assets/Orbit_east.jpeg';
import earthOrbitWest from './assets/Orbit_west.jpeg';
import earthOrbitUp from './assets/Orbit_up.jpeg';
import earthOrbitDown from './assets/Orbit_down.jpeg';

import saturnOrbitNorth from './assets/ES_north.jpeg';
import saturnOrbitSouth from './assets/ES_south.jpeg';
import saturnOrbitEast from './assets/ES_east.jpeg';
import saturnOrbitWest from './assets/ES_west.jpeg';
import saturnOrbitUp from './assets/ES_up.jpeg';
import saturnOrbitDown from './assets/ES_down.jpeg';

import nightOrbitNorth from './assets/Sun_north.jpeg';
import nightOrbitSouth from './assets/Sun_south.jpeg';
import nightOrbitEast from './assets/Sun_east.jpeg';
import nightOrbitWest from './assets/Sun_west.jpeg';
import nightOrbitUp from './assets/Sun_up.jpeg';
import nightOrbitDown from './assets/Sun_down.jpeg';

import marsNorth from './assets/mars_north.jpeg';
import marsSouth from './assets/mars_south.jpeg';
import marsEast from './assets/mars_east.jpeg';
import marsWest from './assets/mars_west.jpeg';
import marsUp from './assets/mars_up.jpeg';
import marsDown from './assets/mars_down.jpeg';

import satelliteNorth from './assets/es2_north.jpeg';
import satelliteSouth from './assets/es2_south.jpeg';
import satelliteEast from './assets/es2_east.jpeg';
import satelliteWest from './assets/mars_west.jpeg';
import satelliteUp from './assets/es2_up.jpeg';
import satelliteDown from './assets/es2_down.jpeg';

import jupiterNorth from './assets/Jup_north.jpeg';
import jupiterSouth from './assets/Jup_south.jpeg';
import jupiterEast from './assets/Jup_east.jpeg';
import jupiterWest from './assets/Jup_west.jpeg';
import jupiterUp from './assets/Jup_up.jpeg';
import jupiterDown from './assets/Jup_down.jpeg';

import starsNorth from './assets/stcm_north.jpeg';
import starsSouth from './assets/stcm_south.jpeg';
import starsEast from './assets/stcm_east.jpeg';
import starsWest from './assets/stcm_west.jpeg';
import starsUp from './assets/stcm_up.jpeg';
import starsDown from './assets/stcm_down.jpeg';

import ringsNorth from './assets/rings_north.jpeg';
import ringsSouth from './assets/rings_south.jpeg';
import ringsEast from './assets/rings_east.jpeg';
import ringsWest from './assets/rings_west.jpeg';
import ringsUp from './assets/rings_up.jpeg';
import ringsDown from './assets/rings_down.jpeg';

type Backdrop = 
    'earth_day' |
 'earth_night'|
  'jupiter'|
   'mars'|
   'satellite' |
    'rings'|
     'saturn'|
      'stars';

export default function Space({backdrop, width, height}: 
    {backdrop: Backdrop,
    width: number,
    height: number}): JSX.Element {
	const Shader = (props: {
        width: number,
        height: number
    }) => {
        const {width, height} = props;
		const meshRef = useRef<any>();
        const [time, setTime] = useState(0);

        const getTex = () => {
            let cubeSurfaces = [];
            switch (backdrop) {
                case 'earth_day': 
                    cubeSurfaces = [
                        earthOrbitEast,
                        earthOrbitWest,
                        earthOrbitUp,
                        earthOrbitDown,
                        earthOrbitNorth,
                        earthOrbitSouth,
                    ];
                    break;
                case 'earth_night': 
                    cubeSurfaces = [
                        nightOrbitEast,
                        nightOrbitWest,
                        nightOrbitUp,
                        nightOrbitDown,
                        nightOrbitNorth,
                        nightOrbitSouth,
                    ];
                    break;
                case 'jupiter':
                    cubeSurfaces = [
                        jupiterEast,
                        jupiterWest,
                        jupiterUp,
                        jupiterDown,
                        jupiterNorth,
                        jupiterSouth,
                    ];
                    break;
                case 'mars':
                    cubeSurfaces = [
                        marsEast,
                        marsWest,
                        marsUp,
                        marsDown,
                        marsNorth,
                        marsSouth,
                    ];
                    break;
                case 'satellite':
                    cubeSurfaces = [
                        satelliteEast,
                        satelliteWest,
                        satelliteUp,
                        satelliteDown,
                        satelliteNorth,
                        satelliteSouth,
                    ];
                    break;
                case 'stars':
                    cubeSurfaces = [
                        starsEast,
                        starsWest,
                        starsUp,
                        starsDown,
                        starsNorth,
                        starsSouth,
                    ];
                    break;
                case 'saturn':
                    cubeSurfaces = [
                        saturnOrbitEast,
                        saturnOrbitWest,
                        saturnOrbitUp,
                        saturnOrbitDown,
                        saturnOrbitNorth,
                        saturnOrbitSouth,
                    ];
                    break;
                case 'rings':
                    cubeSurfaces = [
                        ringsEast,
                        ringsWest,
                        ringsUp,
                        ringsDown,
                        ringsNorth,
                        ringsSouth,
                    ];
                    break;
                default:
                    return undefined;
            }
            const loader = new THREE.CubeTextureLoader();
            const cubeTexture = loader.load(cubeSurfaces);
            return cubeTexture;
        }

        const [uniforms, setUniforms] = useState({
            iResolution: {
                type: 'v2',
                value: new THREE.Vector2(
                    width,
                    height
                )
            },
            iTime: {
                type: 'f',
                value: time,
            },
            iMouse: {
                value: new THREE.Vector4(0, 0, 0, 0)
            },
            cubeMap: {
                value: getTex()
            }
        });

        useFrame((state) => {
            // setTime(state.clock.elapsedTime);
            // console.log(time);
            meshRef.current.material.uniforms.iTime.value = 
            state.clock.elapsedTime;
            invalidate();
        });

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

    return <Canvas style={{width: width, height: height}}>
        <Shader 
            width={2*width} 
            height={2*height}
        />
    </Canvas>
}