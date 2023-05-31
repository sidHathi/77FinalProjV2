import * as THREE from 'three';

export const constructGradientDensityArr = (size: number, time: number): THREE.DataTexture => {
    const width = size;
    const height = size;
    const depth = size;
    const bSize = Math.pow(size, 3)

    const densities: number[] = [];
    for ( let x = 0; x < size; x ++ ) {
        for ( let y = 0; y < size; y ++ ) {
            for ( let z = 0; z < size; z ++ ) {
                densities.push((Math.sin(x + Math.pow(y, 2) + Math.pow(z, 2)) + 1)/2);
            }
        }
    }

    const data = new Uint8Array( bSize*4 );

    for ( let i = 0; i < bSize; i ++ ) {
        const stride = 4;
		data[i*stride] = densities[i] * 234;
		data[i*stride + 1] = densities[i] * 33;
		data[i*stride + 3] = densities[i] * 11;
		data[i*stride + 4] = densities[i] * 255;
    }

    const tex = new THREE.DataTexture(data, width*height, depth, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
};