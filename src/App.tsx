import { useState, useEffect } from 'react';

import * as THREE from 'three';
import SceneInit from './SceneInit';

import hit_record from './hit-record.glsl';
import ray_glsl from './ray.glsl';
import sphere_glsl from './sphere.glsl';
import scene_glsl from './scene.glsl';
import vertexShaderCode from './a_vertex.glsl';
import fragmentShaderCode from './a_fragment.glsl';

export default function App(): JSX.Element {
  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    // const buildTexForColors = ( colorArr: {
    //   r: number,
    //   g: number,
    //   b: number,
    //   a: number
    // }[] ): THREE.Texture => {
    //   const size = colorArr.length;
    //   const buffer = new Uint8Array(4 * size);

    // }

    // define uniform data
    const uniformData = {
      u_resolution: {
        type: 'v2',
        value: new THREE.Vector2(
          test.renderer.domElement.width,
          test.renderer.domElement.height
        )
      },
      u_time: {
        type: 'f',
        value: test.clock.getElapsedTime(),
      },
      u_density: {
        type: '',
        value: Math.sin(test.clock.getElapsedTime())/2 + 1,
      }
    };
    const render = () => {
      uniformData.u_time.value = test.clock.getElapsedTime();
      uniformData.u_density.value = Math.sin(test.clock.getElapsedTime())/2 + 1;
      window.requestAnimationFrame(render);
    };
    render();

    const plane = new THREE.PlaneGeometry(2, 2);
    const boxMaterial = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: uniformData,
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
    });
    const boxMesh = new THREE.Mesh(plane, boxMaterial);
    test.scene.add(boxMesh);
  }, []);

  return (
    <div>
      <canvas id='myThreeJsCanvas'>Hello World</canvas>
    </div>
  )
}
