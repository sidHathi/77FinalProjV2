#include "scene.glsl"

const int size = 128;

varying vec3 pos;
uniform float u_time;
uniform vec2 u_resolution;
// uniform sampler1D u_density;

void main() {
    Scene scene = sc_init();
    vec3 col = sc_col(scene, u_resolution);
    gl_FragColor = vec4(col, 1.);
}
