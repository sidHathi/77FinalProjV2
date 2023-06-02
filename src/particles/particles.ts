import * as THREE from 'three';

export interface Particles {
    size: number;
    positions: THREE.Vector3[];
    velocities: THREE.Vector3[];
    dim: number;
}

export const initializeParticlesInBox = (halfDims: THREE.Vector3, numParticles: number, size: number): Particles => {
    const particleDim = Math.round(Math.pow(numParticles, 0.33));
    const scaleX = 2*halfDims.x / particleDim;
    const scaleY = 2*halfDims.y / particleDim;
    const scaleZ = 2*halfDims.z / particleDim;
    
    const positions: THREE.Vector3[] = [];
    const velocities: THREE.Vector3[] = [];
    for (let i = 0; i < particleDim; i ++) {
        for (let j = 0; j < particleDim; j ++) {
            for (let k = 0; k < particleDim; k ++) {
                const loc = new THREE.Vector3(
                    i * scaleX + (scaleX / 2) - halfDims.x,
                    j * scaleY + (scaleY / 2) - halfDims.y,
                    k * scaleZ + (scaleZ / 2) - halfDims.z
                )
                positions.push(loc);
                velocities.push(new THREE.Vector3(0, 0, 0));
            }
        }
    }
    return {
        size, positions, velocities, dim: particleDim
    };
};

export const buildParticlePosMap = (particles: Particles, pos: THREE.Vector3, halfDims: THREE.Vector3): {
    xTex: THREE.DataTexture,
    yTex: THREE.DataTexture,
    zTex: THREE.DataTexture
} => {
    const { positions, size, dim} = particles;
    const arrSize = positions.length;

    const dataX = new Float32Array( positions.length * 4 );
    const dataY = new Float32Array( positions.length * 4 );
    const dataZ = new Float32Array( positions.length * 4 );
    for ( let i = 0; i < positions.length; i ++ ) {
        const stride = 4;
		dataX[i*stride] = ((positions[i].x) + halfDims.x)/(2 * halfDims.x);
		dataY[i*stride] = ((positions[i].y) + halfDims.y)/(2 * halfDims.y);
		dataZ[i*stride] = ((positions[i].z) + halfDims.z)/(2 * halfDims.z);
    }

    const xTex = new THREE.DataTexture(dataX, arrSize, 1, THREE.RGBAFormat, THREE.FloatType);
    xTex.needsUpdate = true;
    const yTex = new THREE.DataTexture(dataY, arrSize, 1, THREE.RGBAFormat, THREE.FloatType);
    yTex.needsUpdate = true;
    const zTex = new THREE.DataTexture(dataZ, arrSize, 1, THREE.RGBAFormat, THREE.FloatType);
    zTex.needsUpdate = true;
    return {
        xTex,
        yTex,
        zTex
    };
}