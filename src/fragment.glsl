#include "hit-record.glsl"
#include "common.glsl"
#include "sdf.glsl"

varying vec3 glPos;
uniform highp samplerCube cubeMap;

uniform vec2 iResolution;
uniform vec4 iMouse;
uniform highp float iTime;

#define	AA 2
#define HASHSCALE 0.1031

vec3 center = vec3(0., 0., 0);

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float hash(vec3 p3)
{
	p3 = fract(p3 * HASHSCALE); 
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 fade(vec3 t) { return t*t*t*(t*(6.*t-15.)+10.); }

float grad(float hash, vec3 p) 
{
    int h = int(1e4*hash) & 15;
	float u = h<8 ? p.x : p.y,
 		  v = h<4 ? p.y : h==12||h==14 ? p.x : p.z;
    return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
}

//3d perlin noise, based on https://mrl.nyu.edu/~perlin/paper445.pdf and https://mrl.nyu.edu/~perlin/noise/.
float perlinNoise3D(vec3 p)
{
	vec3 pi = floor(p), pf = p - pi, w = fade(pf);
    return mix( mix( mix( grad(hash(pi + vec3(0, 0, 0)), pf - vec3(0, 0, 0)),
                           grad(hash(pi + vec3(1, 0, 0)), pf - vec3(1, 0, 0)), w.x ),
            	      mix( grad(hash(pi + vec3(0, 1, 0)), pf - vec3(0, 1, 0)), 
                	 	   grad(hash(pi + vec3(1, 1, 0)), pf - vec3(1, 1, 0)), w.x ), w.y ),
        		 mix( mix( grad(hash(pi + vec3(0, 0, 1)), pf - vec3(0, 0, 1)), 
                		   grad(hash(pi + vec3(1, 0, 1)), pf - vec3(1, 0, 1)), w.x ),
            		  mix( grad(hash(pi + vec3(0, 1, 1)), pf - vec3(0, 1, 1)), 
                		   grad(hash(pi + vec3(1, 1, 1)), pf - vec3(1, 1, 1)), w.x ), w.y ), w.z );
}

float fbm(vec3 pos, int octaves, float persistence) 
{
    float total = 0.0, frequency = 1.0, amplitude = 1.0, maxValue = 0.0;
    for(int i = 0; i < octaves; ++i) 
    {
        total += perlinNoise3D(pos * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2.0;
    }
    return total / maxValue;
}

float getNoise(vec3 p)
{
    return 0.15 * fbm(p + 0.3*iTime, 4, 0.3);
}

// signed distance function
float map(vec3 p)
{
    float dist = 100.;
    float shape = 100.;
    vec3 pT = p - center;
    vec3 pp = pT;
    float c;
    
    // sphere
    dist = opRound(sdSphere(pT, 1.), 0.2);
    
    // droplets
    c = pModPolar(pT.yz, 4.);
    vec3 rng = hash31(c);
    pT.y -= .5-.25;
    rng.x += sign(pT.x)*.5;
    pT.x = abs(pT.x)-.5;
    pT.z *= -2.;
    float time = iTime * .2 + rng.x;
    float anim = fract(time);
    float index = floor(time);
    float wave = sin(anim*3.14);
    float h = .7+.3*pow(wave, 2.);
    float s = .025-.025*(1.-wave);
    shape = sdSegment(pT, h, s);
    dist = smin(dist, shape, .25);
    shape = 5.*length(pT-vec3(0,pow(anim, 10.)*500.+h,0))-.05;
    dist = smin(dist, shape, .3*pow(anim,0.5));
    
    
    // surface details
    vec3 seed = pp*.1;
    vec2 st = gl_FragCoord.xy/iResolution.xy*3.;
    float noise = getNoise(seed);
    dist -= 5.*noise;
    
    return opSmoothUnion(sdSphere(vec3(0, -505., -1.), 500.), dist, 0.1);
}

//	normal calculation
vec3 calcNormal(vec3 pos)
{
    float eps=0.0001;
	float d=map(pos);
	return normalize(vec3(map(pos+vec3(eps,0,0))-d,map(pos+vec3(0,eps,0))-d,map(pos+vec3(0,0,eps))-d));
}

// 	refraction
float refr(vec3 pos,vec3 lig,vec3 dir,vec3 nor,float angle,out float t2, out vec3 nor2)
{
    float h=0.;
    t2=2.;
	vec3 dir2=refract(dir,nor,angle);  
 	for(int i=0;i<50;i++) 
	{
		if(abs(h)>3.) break;
		h=map(pos+dir2*t2);
		t2-=h;
	}
    nor2=calcNormal(pos+dir2*t2);
    return(.5*clamp(dot(-lig,nor2),0.,1.)+pow(max(dot(reflect(dir2,nor2),lig),0.),8.));
}

//	softshadow 
float softshadow(vec3 ro,vec3 rd) 
{
    float sh=1.;
    float t=.02;
    float h=.0;
    for(int i=0;i<22;i++)  
	{
        if(t>20.)continue;
        h=map(ro+rd*t);
        sh=min(sh,4.*h/t);
        t+=h;
    }
    return sh;
}

bool raySphereFieldInteract(in Ray r, inout HitRecord rec) {
    int iters = 1;
    int max_iter = 70;
    vec3 loc = r.origin;
    bool hit = false;
    float step_size = 1.;
    vec2 noff = vec2(.001,0);
    while (!hit && iters < max_iter) {
        step_size = map(loc);
        loc = loc + r.direction * step_size/3.;
        if (step_size < 20.*EPSILON) {
            rec.p = loc;    
            vec3 normal = calcNormal(loc);
            rec.t = step_size;
            rec.normal = normal;
            hit = true;
            return true;
        }
        iters += 1;
    }
    return false;
}

vec3 env_tex(vec3 pos) {
	return pow(textureCube(cubeMap, pos).rgb, vec3(2.2));
}

vec3 sc_ray_color(in Ray r) {
    HitRecord rec;
    vec3 basecol=vec3(1./3. ,  1./3. , 1./3.);
    vec3 color = env_tex(r.direction);
    if (raySphereFieldInteract(r, rec)) {
        vec3 lig=normalize(vec3(.2,6.,.5));
        if (rec.t < 1000.) {
            color = 0.3*vec3(env_tex(reflect(r.direction,rec.normal)));
            vec3 refractDir = refract(r.direction, rec.normal, 0.8);
    	    color *= 3.*clamp(softshadow(rec.p,lig),0.,1.);  // shadow            	
            
            color += 2.4*pow(textureCube(cubeMap, refractDir).rgb, vec3(2.2)) * 0.9;
            color = (color);
        } else {
            return vec3(1.);
        }
        return 0.1*basecol + 1.75*color;
        // return normalize(0.5 * (rec.normal + vec3(1., 1., 1.)));
    }
    vec3 unit_dir = normalize(r.direction);
    float t = 0.5*(unit_dir.y + 1.0);
    return 0.1*basecol + 0.9*color;
}

// TASK 2.1
void compute_camera_frame(vec3 dir, vec3 up, out vec3 u, out vec3 v, out vec3 w)
{
    u = normalize(cross(up, dir));
    w = normalize(-dir);
    v = normalize(up);
}

// TASK 2.3
Ray generate_ray_perspective(vec2 uv, vec3 eye, vec3 u, vec3 v, vec3 w, float focal_length)
{

    vec3 rayOrigin = eye;
    vec3 rayDirection = -focal_length*w + uv.x*u + uv.y*v;
    return Ray(rayOrigin, rayDirection);
}

vec3 sc_col() {
    /*
        Initial implementation:
        Create a ray from the origin through the uv coords of the screen
        return the color provided by the ray_color function
    */

    vec4 m = iMouse/iResolution.x;

    vec2 res = iResolution.xy;
    float aspect = res.x / res.y;
    vec2 uv = gl_FragCoord.xy / res.xy - 0.5;
    uv.x *= aspect;

    // Rotate the camera
    vec3 eye = vec3(-6.0 * cos(iTime * 0.2), 4.0 + 0.5 * sin(iTime * 0.1), -12.0 * sin(iTime * 0.2));
    if (m.z > 0.5) {
        vec2 angle = (iMouse.z > 0.5) ? 4.0*(2.0*iMouse.xy/iResolution.xy-1.0) : vec2(0.0);
        eye =  vec3(-12.0 * cos(angle.x * 0.2), 4.0 + 0.5 * sin(angle.x * 0.1), -12.0 * sin(angle.x * 0.2));
    }
    vec3 dir = vec3(0.0, 0.0, 0.0) - eye;
    vec3 up = vec3(0, 1, 0);

    float focal_length = 2.;

    vec3 u, v, w;
    compute_camera_frame(dir, up, u, v, w);

    Ray ray = generate_ray_perspective(uv, eye, u, v, w, focal_length);
;
    return sc_ray_color(ray);
}

void main() {
    vec3 col = sc_col();
    gl_FragColor = vec4(col, 1.);
    // gl_FragColor = vec4(iTime, iTime, iTime, 1.);
}