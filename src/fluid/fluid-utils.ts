/*
*
* Utility Functions for simulating fluids with Ray Tracing
* Sid Hathi and Brody Thompson
* 
*/


export function IX(x: number, y: number, z: number, N: number) {
  return (x + (y * N) + (z * N * N));
}

export function set_bnd(b: number, x: number[], N: number) {

  for (let j = 1; j < N; j++) {
    for (let i = 1; i < N - 1; i++) {
      // ASK: do we need to assign values here/ whats the word with these
      x[IX(i, j, 0, N)] = b == 3 ? -x[IX(i, j, 1, N)] : x[IX(i, j, 1, N)];
      x[IX(i, j, N - 1, N)] = b == 3 ? -x[IX(i, j, N - 2, N)] : x[IX(i, j, N - 2, N)];
    }
  }

  for (let k = 1; k < N - 1; k++) {
    for (let i = 1; i < N - 1; i++) {
      x[IX(i, 0, k, N)] = b == 2 ? -x[IX(i, 1, k, N)] : x[IX(i, 1, k, N)];
      x[IX(i, N - 1, k, N)] = b == 2 ? -x[IX(i, N - 2, k, N)] : x[IX(i, N - 2, k, N)];
    }
  }
  for (let k = 1; k < N - 1; k++) {
    for (let j = 1; j < N - 1; j++) {
      x[IX(0, j, k, N)] = b == 1 ? -x[IX(1, j, k, N)] : x[IX(1, j, k, N)];
      x[IX(N - 1, j, k, N)] = b == 1 ? -x[IX(N - 2, j, k, N)] : x[IX(N - 2, j, k, N)];
    }
  }
  x[IX(0, 0, 0, N)] = 0.33 * (x[IX(1, 0, 0, N)]
    + x[IX(0, 1, 0, N)]
    + x[IX(0, 0, 1, N)]);
  x[IX(0, N - 1, 0, N)] = 0.33 * (x[IX(1, N - 1, 0, N)]
    + x[IX(0, N - 2, 0, N)]
    + x[IX(0, N - 1, 1, N)]);
  x[IX(0, 0, N - 1, N)] = 0.33 * (x[IX(1, 0, N - 1, N)]
    + x[IX(0, 1, N - 1, N)]
    + x[IX(0, 0, N, N)]);
  x[IX(0, N - 1, N - 1, N)] = 0.33 * (x[IX(1, N - 1, N - 1, N)]
    + x[IX(0, N - 2, N - 1, N)]
    + x[IX(0, N - 1, N - 2, N)]);
  x[IX(N - 1, 0, 0, N)] = 0.33 * (x[IX(N - 2, 0, 0, N)]
    + x[IX(N - 1, 1, 0, N)]
    + x[IX(N - 1, 0, 1, N)]);
  x[IX(N - 1, N - 1, 0, N)] = 0.33 * (x[IX(N - 2, N - 1, 0, N)]
    + x[IX(N - 1, N - 2, 0, N)]
    + x[IX(N - 1, N - 1, 1, N)]);
  x[IX(N - 1, 0, N - 1, N)] = 0.33 * (x[IX(N - 2, 0, N - 1, N)]
    + x[IX(N - 1, 1, N - 1, N)]
    + x[IX(N - 1, 0, N - 2, N)]);
  x[IX(N - 1, N - 1, N - 1, N)] = 0.33 * (x[IX(N - 2, N - 1, N - 1, N)]
    + x[IX(N - 1, N - 2, N - 1, N)]
    + x[IX(N - 1, N - 1, N - 2, N)]);

}

export function lin_solve(b: number, x: number[], x0: number[], a: number, c: number, iter: number, N: number) {
  const cRecip = 1.0 / c;

  for (let k = 0; k < iter; k++) {
    for (let m = 1; m < N - 1; m++) {
      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          x[IX(i, j, m, N)] =
            (x0[IX(i, j, m, N)]
              + a * (x[IX(i + 1, j, m, N)]
                + x[IX(i - 1, j, m, N)]
                + x[IX(i, j + 1, m, N)]
                + x[IX(i, j - 1, m, N)]
                + x[IX(i, j, m + 1, N)]
                + x[IX(i, j, m - 1, N)])) * cRecip;
        }
      }
    }
    set_bnd(b, x, N);
  }
}
// 
export function diffuse(b: number, x: number[], x0: number[], diff: number, dt: number, iter: number, N: number) {

  const a = dt * diff * (N - 2) * (N - 2);
  lin_solve(b, x, x0, a, 1 + (6 * a), iter, N);
}

// project(Vx0, Vy0, Vz0, Vx, Vy, 4, N);
//inout float velocX[MAX_ARR_SIZE], inout float velocY[MAX_ARR_SIZE], 
//inout float velocZ[MAX_ARR_SIZE], inout float p[MAX_ARR_SIZE], 
//inout float div[MAX_ARR_SIZE], int iter, int N

export function project(velocX: number[], velocY: number[], velocZ: number[], p: number[], div: number[], iter: number, N: number) {

  for (let k = 1; k < N - 1; k++) {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        div[IX(i, j, k, N)] = -0.5 * (
          velocX[IX(i + 1, j, k, N)]
          - velocX[IX(i - 1, j, k, N)]
          + velocY[IX(i, j + 1, k, N)]
          - velocY[IX(i, j - 1, k, N)]
          + velocZ[IX(i, j, k + 1, N)]
          - velocZ[IX(i, j, k - 1, N)]
        ) / N;
        p[IX(i, j, k, N)] = 0;
      }
    }
  }

  set_bnd(0, div, N);
  set_bnd(0, p, N);
  //check Params below
  lin_solve(0, p, div, 1, 6, iter, N);

  for (let k = 1; k < N - 1; k++) {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        velocX[IX(i, j, k, N)] -= 0.5 * (p[IX(i + 1, j, k, N)]
          - p[IX(i - 1, j, k, N)]) * N;
        velocY[IX(i, j, k, N)] -= 0.5 * (p[IX(i, j + 1, k, N)]
          - p[IX(i, j - 1, k, N)]) * N;
        velocZ[IX(i, j, k, N)] -= 0.5 * (p[IX(i, j, k + 1, N)]
          - p[IX(i, j, k - 1, N)]) * N;
      }
    }
  }

  //check issue of x vs y in input of set_bnd
  set_bnd(1, velocX, N);
  set_bnd(2, velocY, N);
  set_bnd(3, velocZ, N);

}

export function advect(b: number, d: number[], d0: number[], velocX: number[], velocY: number[], velocZ: number[], dt: number, N: number) {

  var i0: number, i1: number, j0: number, j1: number, k0: number, k1: number;

  var dtx = dt * (N - 2);
  var dty = dt * (N - 2);
  var dtz = dt * (N - 2);

  var s0: number, s1: number, t0: number, t1: number, u0: number, u1: number;
  var tmp1: number, tmp2: number, tmp3: number, x: number, y: number, z: number;

  var ifloat: number, jfloat: number, kfloat: number;
  var i: number, j: number, k: number;


  // removed Nfloat
  for (k = 1, kfloat = 1.; k < N - 1; k++, kfloat++) {
    for (j = 1, jfloat = 1.; j < N - 1; j++, jfloat++) {
      for (i = 1, ifloat = 1.; i < N - 1; i++, ifloat++) {
        tmp1 = dtx * velocX[IX(i, j, k, N)];
        tmp2 = dty * velocY[IX(i, j, k, N)];
        tmp3 = dtz * velocZ[IX(i, j, k, N)];
        x = ifloat - tmp1;
        y = jfloat - tmp2;
        z = kfloat - tmp3;

        if (x < 0.5) x = 0.5;
        if (x > N + 0.5) x = N + 0.5;
        i0 = Math.floor(x);
        i1 = i0 + 1.0;
        if (y < 0.5) y = 0.5;
        if (y > N + 0.5) y = N + 0.5;
        j0 = Math.floor(y);
        j1 = j0 + 1.0;
        if (z < 0.5) z = 0.5;
        if (z > N + 0.5) z = N + 0.5;
        k0 = Math.floor(z);
        k1 = k0 + 1.0;

        s1 = x - i0;
        s0 = 1.0 - s1;
        t1 = y - j0;
        t0 = 1.0 - t1;
        u1 = z - k0;
        u0 = 1.0 - u1;

        //removed int casting
        var i0i = i0;
        var i1i = i1;
        var j0i = j0;
        var j1i = j1;
        var k0i = k0;
        var k1i = k1;

        d[IX(i, j, k, N)] =

          s0 * (t0 * (u0 * d0[IX(i0i, j0i, k0i, N)]
            + u1 * d0[IX(i0i, j0i, k1i, N)])
            + (t1 * (u0 * d0[IX(i0i, j1i, k0i, N)]
              + u1 * d0[IX(i0i, j1i, k1i, N)])))
          + s1 * (t0 * (u0 * d0[IX(i1i, j0i, k0i, N)]
            + u1 * d0[IX(i1i, j0i, k1i, N)])
            + (t1 * (u0 * d0[IX(i1i, j1i, k0i, N)]
              + u1 * d0[IX(i1i, j1i, k1i, N)])));
      }
    }
  }
  set_bnd(b, d, N);


}