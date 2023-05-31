import { useState, useEffect } from 'react';

import * as THREE from 'three';
import SceneInit from './SceneInit';

import hit_record from './hit-record.glsl';
import ray_glsl from './ray.glsl';
import sphere_glsl from './sphere.glsl';
import scene_glsl from './scene.glsl';
import vertexShaderCode from './a_vertex.glsl';
import fragmentShaderCode from './a_fragment.glsl';

import { constructGradientDensityArr } from './tests';
import Quaternion from 'quaternion';

export default function App(): JSX.Element {
  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    const dataTex: THREE.DataTexture = constructGradientDensityArr(64, 0);
    const q = new Quaternion( 0.1087553, 0.0, 0.1087553, 0.9840922 );
    const qrm = q.toMatrix4(false)

    const rotation = new THREE.Matrix4();
    rotation.set(
        ...qrm
    )

    // console.log(dataTex);
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
        value: Math.round(test.clock.getElapsedTime()),
      },
      u_cube_pos: {
        type: 'v3',
        value: new THREE.Vector3(0, 0, -1)
      },
      u_density: {
        type: 't',
        value: dataTex,
      },
      u_cube_rot: {
        value: rotation,
      }
    };
    const render = () => {
      uniformData.u_time.value = test.clock.getElapsedTime();
      uniformData.u_density.value = constructGradientDensityArr(64, test.clock.getElapsedTime());
      uniformData.u_cube_pos.value = new THREE.Vector3(Math.sin(test.clock.getElapsedTime())/10, Math.cos(test.clock.getElapsedTime())/10, -1)
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
