// import { useState, useEffect } from 'react';

// import * as THREE from 'three';
// import SceneInit from './SceneInit';

// import hit_record from './hit-record.glsl';
// import ray_glsl from './ray.glsl';
// import sphere_glsl from './sphere.glsl';
// import scene_glsl from './scene.glsl';
// import vertexShaderCode from './a_vertex.glsl';
// import fragmentShaderCode from './a_fragment.glsl';

// import { constructGradientDensityArr } from './tests';
// import Quaternion from 'quaternion';
// import { FluidCube, fc_create, fc_add_density, fc_add_velocity, fc_step, fc_get_tex } from './fluid/fluid';
import ParticleDisplay from "./Particles"

export default function App(): JSX.Element {
  // const [fluidCube, setFluidCube] = useState<FluidCube | undefined>( undefined );
  // const [t, setT] = useState(0);

  // const iter_fc = (fc: FluidCube | undefined) => {
  //   if (fc === undefined) {
  //     return;
  //   }
  //   console.log(fc.density.reduce((sum, val) => sum + val, 0));

  //   const cx = Math.round(Math.random() * fc.size);
  //   const cy = Math.round(Math.random() * fc.size);
  //   const cz = Math.round(Math.random() * fc.size);
    
  //   for (let i = -1; i <= 2; i++) {
  //     for (let j = -1; j <= 2; j++) {
  //       for (let k = -1; k <= 2; k++) {
  //         fc_add_density(fc, cx + i, cy + j, cz + k, 255*Math.random());
  //       }
  //     }
  //   }

  //   for (let i = 0; i < 2; i++) {
  //     const angle = Math.random() * Math.PI * 4;
  //     const v = new THREE.Vector3(20* Math.random() * Math.cos(angle), 10*Math.random() * Math.sin(angle), 2*Math.random() * angle);
  //     fc_add_velocity(fc, cx, cy, cz, v.x, v.y, v.z);
  //   }

  //   for (let i = 0; i < 1/fc.dt; i++) {
  //     fc = fc_step(fc);
  //   }
  //   // if (fc && (fc.density.reduce((sum, val) => sum + val, 0))) {
  //   //   // console.error('Nan')
  //   //   return;
  //   // }
  //   setFluidCube(fc);
  // }

  // const getRotMatFromTime = (time: number) => {
  //   const q = new Quaternion( 0.4533085, (Math.sin(time/10)/100) + 0.1918685, 0.4533085, 0.7431078 );
  //   const qrm = q.toMatrix4(false);
  //   return qrm;
  // }

  // useEffect(() => {
  //   const test = new SceneInit('myThreeJsCanvas');
  //   test.initialize();
  //   test.animate();

  //   const pos = new THREE.Vector3(0, 0, -1);
  //   const size = 8;
  //   const scale = 1. / size;
  //   const diffusion = 0.2;
  //   const viscosity = 0.1;
  //   const dt = 0.00001;
  //   let fc: FluidCube = fc_create(scale, pos, size, diffusion, viscosity, dt);
  //   if (fluidCube) {
  //     fc = fluidCube;
  //   }
  //   // console.log(fc);
  //   setFluidCube(fc);

  //   const dataTex: THREE.DataTexture | undefined = fc_get_tex(fc);
  //   if (!dataTex) return;

  //   const rotation = new THREE.Matrix4();
  //   rotation.set(
  //       ...getRotMatFromTime(test.clock.getElapsedTime())
  //   )

  //   // console.log(dataTex);
  //   // define uniform data
  //   const uniformData = {
  //     u_resolution: {
  //       type: 'v2',
  //       value: new THREE.Vector2(
  //         test.renderer.domElement.width,
  //         test.renderer.domElement.height
  //       )
  //     },
  //     u_time: {
  //       value: Math.round(test.clock.getElapsedTime()),
  //     },
  //     u_cube_pos: {
  //       type: 'v3',
  //       value: new THREE.Vector3(0, 0, -1)
  //     },
  //     u_density: {
  //       type: 't',
  //       value: dataTex,
  //     },
  //     u_cube_rot: {
  //       value: rotation,
  //     }
  //   };
  //   const render = () => {
  //     iter_fc(fluidCube);
  //     uniformData.u_time.value = test.clock.getElapsedTime();
  //     uniformData.u_density.value = fc_get_tex(fluidCube || fc) || constructGradientDensityArr(32, test.clock.getElapsedTime());
  //     uniformData.u_cube_pos.value = new THREE.Vector3(Math.sin(test.clock.getElapsedTime())/30, Math.cos(test.clock.getElapsedTime())/30, -1)
  //     window.requestAnimationFrame(render);
  //     uniformData.u_cube_rot.value = rotation.set(...getRotMatFromTime(0));
  //   };
  //   render();

  //   const plane = new THREE.PlaneGeometry(2, 2);
  //   const boxMaterial = new THREE.ShaderMaterial({
  //     wireframe: false,
  //     uniforms: uniformData,
  //     vertexShader: vertexShaderCode,
  //     fragmentShader: fragmentShaderCode,
  //   });
  //   const boxMesh = new THREE.Mesh(plane, boxMaterial);
  //   test.scene.add(boxMesh);
  // }, []);

  return (
    <ParticleDisplay />
  )
}
