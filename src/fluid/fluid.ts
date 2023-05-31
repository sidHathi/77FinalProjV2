import *  as fluid from './fluid-utils.ts';
import * as THREE from 'three';


export interface FluidCube {
  scale: number,
  center: THREE.Vector3,
  size: number,
  dt: number,
  diff: number,
  visc: number,

  pdensity: number[],
  density: number[],
  Vx: number[],
  Vy: number[],
  Vz: number[],

  Vx0: number[],
  Vy0: number[],
  Vz0: number[],
};

function fc_create(scale: number, center: THREE.Vector3, size: number, diffusion: number, viscosity: number, dt: number) {
  const pdensity: number[] = [];
  const density: number[] = [];
  const Vx: number[] = [];
  const Vy: number[] = [];
  const Vz: number[] = [];

  const Vx0: number[] = [];
  const Vy0: number[] = [];
  const Vz0: number[] = [];

  const c: FluidCube = {
    scale,
    center,
    size,
    dt,
    diff: diffusion,
    visc: viscosity,
    pdensity,
    density,
    Vx,
    Vy,
    Vz,
    Vx0,
    Vy0,
    Vz0
  };

  return c;
};

function fc_add_density(cube: FluidCube, x: number, y: number, z: number, amt: number) {

  const N = cube.size;
  const index = fluid.IX(x, y, z, N);
  cube.density[index] += amt;

}

function fc_add_velocity(cube: FluidCube, x: number, y: number, z: number, amtX: number, amtY: number, amtZ: number) {

  const N = cube.size;
  const index = fluid.IX(x, y, z, N);
  cube.Vx[index] += amtX;
  cube.Vy[index] += amtY;
  cube.Vz[index] += amtZ;

}

function fc_step(cube: FluidCube) {

  const N = cube.size;

  fluid.diffuse(1, cube.Vx0, cube.Vx, cube.visc, cube.dt, 4, N);
  fluid.diffuse(2, cube.Vy0, cube.Vy, cube.visc, cube.dt, 4, N);
  fluid.diffuse(3, cube.Vz0, cube.Vz, cube.visc, cube.dt, 4, N);

  fluid.project(cube.Vx0, cube.Vy0, cube.Vz0, cube.Vx, cube.Vy, 4, N);

  fluid.advect(1, cube.Vx, cube.Vx0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);
  fluid.advect(2, cube.Vy, cube.Vy0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);
  fluid.advect(3, cube.Vz, cube.Vz0, cube.Vx0, cube.Vy0, cube.Vz0, cube.dt, N);

  fluid.project(cube.Vx, cube.Vy, cube.Vz, cube.Vx0, cube.Vy0, 4, N);

  fluid.diffuse(0, cube.pdensity, cube.density, cube.diff, cube.dt, 4, N);
  fluid.advect(0, cube.density, cube.pdensity, cube.Vx, cube.Vy, cube.Vz, cube.dt, N);

}

function fc_point_density(cube: FluidCube, point: THREE.Vector3) {
  var N = cube.size;
  // naive -> improve to binary search later
  // CHECK THAT THE subScalar METHOD IS WORKING PROPERLY
  var bottomLeft = cube.center.subScalar(N * cube.scale / 2);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        var xLB = bottomLeft.x + (cube.scale * i) + cube.scale * 0.0;
        var xGB = bottomLeft.x + (cube.scale * i) + cube.scale * 1.0;
        var yLB = bottomLeft.y + (cube.scale * j) + cube.scale * 0.0;
        var yGB = bottomLeft.y + (cube.scale * j) + cube.scale * 1.0;
        var zLB = bottomLeft.z + (cube.scale * k) + cube.scale * 0.0;
        var zGB = bottomLeft.z + (cube.scale * k) + cube.scale * 1.0;
        if (point.x > xLB && point.x < xGB && point.y > yLB && point.y < yGB && point.z > zLB && point.z < zGB) {
          return cube.density[fluid.IX(i, j, k, N)];
        }
      }
    }
  }
  return 1.;
}

function sdBox(p: THREE.Vector3, half_bounds: THREE.Vector3) {
  var d = 0;
  if (Math.abs(p.x) < half_bounds.x && Math.abs(p.y) < half_bounds.y && Math.abs(p.z) < half_bounds.z) {
    return Math.max(Math.max(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y), Math.abs(p.z) - half_bounds.z);
  }
  else if (Math.abs(p.x) < half_bounds.x) {
    if (Math.abs(p.y) < half_bounds.y) {
      d = Math.abs(p.z) - half_bounds.z;
    }
    else {
      if (Math.abs(p.z) < half_bounds.z) {
        d = Math.abs(p.y) - half_bounds.y;
      } else {
        var tempVec2 = new THREE.Vector2(Math.abs(p.y) - half_bounds.y, Math.abs(p.z) - half_bounds.z);
        d = tempVec2.length();
      }
    }
  }
  else if (Math.abs(p.y) <= half_bounds.y) {
    if (Math.abs(p.z) <= half_bounds.z) {
      d = Math.abs(p.x) - half_bounds.x;
    }
    else {
      var tempVec2 = new THREE.Vector2(Math.abs(p.x) - half_bounds.x, Math.abs(p.z) - half_bounds.z);
      d = tempVec2.length();
    }
  }
  else {
    if (Math.abs(p.z) <= half_bounds.z) {
        var tempVec2 = new THREE.Vector2(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y);
        d = tempVec2.length();
    } else {
      var tempVec3 = new THREE.Vector3(Math.abs(p.x) - half_bounds.x, Math.abs(p.y) - half_bounds.y, Math.abs(p.z) - half_bounds.z);
        d = tempVec3.length();
    }
}
return d;
}
