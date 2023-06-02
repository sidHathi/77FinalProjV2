import *  as fluid from './fluid-utils.ts';
import * as THREE from 'three';


export interface FluidCube {
  scale: number,
  center: THREE.Vector3,
  size: number,
  dt: number,
  diff: number,
  visc: number,

  s: number[],
  density: number[],
  Vx: number[],
  Vy: number[],
  Vz: number[],

  Vx0: number[],
  Vy0: number[],
  Vz0: number[],
}

export const fc_create = (scale: number, center: THREE.Vector3, size: number, diffusion: number, viscosity: number, dt: number) => {
  const dimSize = Math.pow(size, 3);
  const s: number[] = new Array<number>(dimSize).fill(0);
  const density: number[] = new Array<number>(dimSize).fill(0);
  const Vx: number[] = new Array<number>(dimSize).fill(0);
  const Vy: number[] = new Array<number>(dimSize).fill(0);
  const Vz: number[] = new Array<number>(dimSize).fill(0);

  const Vx0: number[] = new Array<number>(dimSize).fill(0);
  const Vy0: number[] = new Array<number>(dimSize).fill(0);
  const Vz0: number[] = new Array<number>(dimSize).fill(0);
  for (let i = 0; i < dimSize; i ++ ) {
    density[i] = 0.2;
    s[i] = 0;
    Vx[i] = 0;
    Vy[i] = 0;
    Vz[i] = 0;
    Vx0[i] = 0;
    Vy0[i] = 0;
    Vz0[i] = 0;
  }

  const c: FluidCube = {
    scale,
    center,
    size,
    dt,
    diff: diffusion,
    visc: viscosity,
    s,
    density,
    Vx,
    Vy,
    Vz,
    Vx0,
    Vy0,
    Vz0
  };

  return c;
}

export const fc_get_tex =(cube: FluidCube): THREE.DataTexture | undefined => {
    const width = cube.size;
    const height = cube.size;
    const depth = cube.size;
    const bSize = Math.pow(cube.size, 3);
    if (cube.density.length < bSize) {
        return;
    }

    const data = new Uint8Array( bSize*4 );
    for ( let i = 0; i < bSize; i ++ ) {
        const stride = 4;
		data[i*stride] = cube.density[i]*255;
		data[i*stride + 1] = cube.density[i]*255;
		data[i*stride + 3] = cube.density[i]*255;
		data[i*stride + 4] = cube.density[i]*255;
    }

    const tex = new THREE.DataTexture(data, width*height, depth, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
}

export const fc_add_density = (cube: FluidCube, x: number, y: number, z: number, amt: number) => {

    const N = cube.size;
    const index = fluid.IX(x, y, z, N);
    cube.density[index] += amt;
    return cube;
}

export const fc_add_velocity = (cube: FluidCube, x: number, y: number, z: number, amtX: number, amtY: number, amtZ: number) => {

    const N = cube.size;
    const index = fluid.IX(x, y, z, N);
    cube.Vx[index] += amtX;
    cube.Vy[index] += amtY;
    cube.Vz[index] += amtZ;
    return cube;
}

const is_nan = (cube: FluidCube) => {
    for (let i = 0; i < Math.pow(cube.size, 3); i ++ ) {
        if (isNaN(cube.Vx[i]) || isNaN(cube.Vy[i]) || isNaN(cube.Vz[i])
        || isNaN(cube.Vx0[i]) || isNaN(cube.Vy0[i]) || isNaN(cube.Vz0[i])
        || isNaN(cube.density[i]) || isNaN(cube.s[i])) {
            console.log(i)
            console.log(cube.Vx[i]);
            console.log(cube.Vy[i]);
            console.log(cube.Vz[i]);
            console.log(cube.Vx0[i]);
            console.log(cube.Vy0[i]);
            console.log(cube.Vz0[i]);
            console.log(cube.density[i]);
            console.log(cube.s[i]);
            return true;
        }
    }
    return false;
}

export const fc_step = (cube: FluidCube) => {

  const N = cube.size;

  const {x: Vx, x0: Vx0} = fluid.diffuse(1, cube.Vx0, cube.Vx, cube.visc, cube.dt, 4, N);
  cube = {...cube, Vx, Vx0};
  const {x: Vy, x0: Vy0} = fluid.diffuse(2, cube.Vy0, cube.Vy, cube.visc, cube.dt, 4, N);
  cube = {...cube, Vy, Vy0};
  const {x: Vz, x0: Vz0} = fluid.diffuse(3, cube.Vz0, cube.Vz, cube.visc, cube.dt, 4, N);
  cube = {...cube, Vz, Vz0};

let proj = fluid.project(cube.Vx0, cube.Vy0, cube.Vz0, cube.Vx, cube.Vy, 4, N)
  cube = {...cube, Vx0: proj.velocX, Vy0: proj.velocY, Vz0: proj.velocZ, Vx: proj.p, Vy: proj.div};

   
  const advectionX = fluid.advect(1, cube.Vx, cube.Vx0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);
  cube = {...cube, Vx: advectionX.d, Vx0: advectionX.d0};
  const advectionY = fluid.advect(2, cube.Vy, cube.Vy0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);
  cube = {...cube, Vy: advectionY.d, Vy0: advectionY.d0};
  const advectionZ = fluid.advect(3, cube.Vz, cube.Vz0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);
  cube = {...cube, Vz: advectionZ.d, Vz0: advectionZ.d0};

  proj = fluid.project(cube.Vx, cube.Vy, cube.Vz, cube.Vx0, cube.Vy0, 4, N);cube = {...cube, Vx0: proj.velocX, Vy0: proj.velocY, Vz0: proj.velocZ, Vx: proj.p, Vy: proj.div};

  const difRes = fluid.diffuse(0, cube.s, cube.density, cube.diff, cube.dt, 4, N);
  cube = {...cube, density: difRes.x0, s: difRes.x};
  const advectionD = fluid.advect(0, cube.density, cube.s, cube.Vx, cube.Vy, cube.Vz, cube.dt, N);
  cube = {...cube, density: advectionD.d, s: advectionD.d0};

  return cube;
}

// export function fc_point_density(cube: FluidCube, point: THREE.Vector3) {
//   const N = cube.size;
//   // naive -> improve to binary search later
//   // CHECK THAT THE subScalar METHOD IS WORKING PROPERLY
//   const bottomLeft = cube.center.subScalar(N * cube.scale / 2);
//   for (let i = 0; i < N; i++) {
//     for (let j = 0; j < N; j++) {
//       for (let k = 0; k < N; k++) {
//         const xLB = bottomLeft.x + (cube.scale * i) + cube.scale * 0.0;
//         const xGB = bottomLeft.x + (cube.scale * i) + cube.scale * 1.0;
//         const yLB = bottomLeft.y + (cube.scale * j) + cube.scale * 0.0;
//         const yGB = bottomLeft.y + (cube.scale * j) + cube.scale * 1.0;
//         const zLB = bottomLeft.z + (cube.scale * k) + cube.scale * 0.0;
//         const zGB = bottomLeft.z + (cube.scale * k) + cube.scale * 1.0;
//         if (point.x > xLB && point.x < xGB && point.y > yLB && point.y < yGB && point.z > zLB && point.z < zGB) {
//           return cube.density[fluid.IX(i, j, k, N)];
//         }
//       }
//     }
//   }
//   return 1.;
// }

// export function sdBox(p: THREE.Vector3, half_bounds: THREE.Vector3) {
//     let d = 0;
//     if (Math.abs(p.x) < half_bounds.x && Math.abs(p.y) < half_bounds.y && Math.abs(p.z) < half_bounds.z) {
//         return Math.max(Math.max(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y), Math.abs(p.z) - half_bounds.z);
//     }
//     else if (Math.abs(p.x) < half_bounds.x) {
//         if (Math.abs(p.y) < half_bounds.y) {
//         d = Math.abs(p.z) - half_bounds.z;
//         }
//         else {
//         if (Math.abs(p.z) < half_bounds.z) {
//             d = Math.abs(p.y) - half_bounds.y;
//         } else {
//             const tempVec2 = new THREE.Vector2(Math.abs(p.y) - half_bounds.y, Math.abs(p.z) - half_bounds.z);
//             d = tempVec2.length();
//         }
//         }
//     }
//     else if (Math.abs(p.y) <= half_bounds.y) {
//         if (Math.abs(p.z) <= half_bounds.z) {
//         d = Math.abs(p.x) - half_bounds.x;
//         }
//         else {
//         const tempVec2 = new THREE.Vector2(Math.abs(p.x) - half_bounds.x, Math.abs(p.z) - half_bounds.z);
//         d = tempVec2.length();
//         }
//     }
//     else {
//         if (Math.abs(p.z) <= half_bounds.z) {
//             const tempVec2 = new THREE.Vector2(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y);
//             d = tempVec2.length();
//         } else {
//         const tempVec3 = new THREE.Vector3(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y, Math.abs(p.z) - half_bounds.z);
//             d = tempVec3.length();
//         }
// }
// return d;
// }
