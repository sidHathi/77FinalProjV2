varying vec3 pos;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_density;

void main()	{
    vec4 result;
    pos = position;

    gl_Position = vec4(pos, 1.);
}
