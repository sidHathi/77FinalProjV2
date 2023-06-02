varying vec3 glPos;

uniform vec2 iResolution;
uniform vec4 iMouse;
uniform highp float iTime;

void main()	{
    vec4 result;
    glPos = position;

    gl_Position = vec4(glPos, 1.);
}
