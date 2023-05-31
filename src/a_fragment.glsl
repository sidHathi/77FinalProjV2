#include "sphere.glsl"
#include "common.glsl"
#include "fluid_cube.glsl"

const int size = 64;

varying vec3 pos;
uniform vec2 u_resolution;
uniform highp float u_time;
uniform sampler2D u_density;
uniform vec3 u_cube_pos;
uniform mat4 u_cube_rot;

struct Scene {
    Sphere sphere;
    FluidCube fc;
};

float dCoordVal(int x, int y, int z, int N) {
    // return 1.;
    // return 0.;
    return texture2D(u_density, vec2(x  +  y * N, z)).a;
}

Scene sc_init() {
    Sphere sphere = Sphere(vec3(0., 0., -1.), 0.5);
    FluidCube fc = FluidCube(
        u_cube_pos,
        size,
        (0.25 / float(size)),
        u_cube_rot
    );
    return Scene(
        sphere,
        fc
    );
}

vec3 genDCoord(in Scene s, in vec3 loc) {
    vec3 point = (inverse(fc_basis(s.fc)) * vec4(loc, 1.)).xyz;
    float halfSideLength = float(s.fc.subdiv) * s.fc.scale / 2.;
    // if (fc_sd(sampleFc, point) > 0.) {
    //     return vec3(0., 0., 0.);
    // }

    vec3 dif = point;
    float x = abs(dif.x*(1./s.fc.scale));
    float y = abs(dif.y*(1./s.fc.scale));
    float z = abs(dif.z*(1./s.fc.scale));
    // float x = rand1(g_seed) * float(s.fc.subdiv);
    // float y = rand1(g_seed) * float(s.fc.subdiv);
    // float z = rand1(g_seed) * float(s.fc.subdiv);
    return vec3(x/2., y/2., z/2.);
}

bool rayFluidInteract(in FluidCube cube, in Ray r, float t_min, float t_max, inout HitRecord rec) {
    // Strategy -> treat the cube like an actual cube
    // find closest hit point and normal
    // reflect based on the density of the cube at the hit point coord
    // requires being able to look up the density at a point
    int iters = 1;
    int max_iter = 10;
    vec3 loc = r.origin;
    bool hit = false;
    float step_size = 1.;
    while (!hit && iters < max_iter) {
        step_size = fc_sd(cube, loc);
        loc = loc + r.direction * step_size;
        if (step_size < EPSILON) {
            hit = true;
            rec.t = length((loc  - r.origin))/length(r.direction);
            rec.p = loc;
            vec3 outward_normal = normalize((rec.p - (cube.center + rand3(g_seed))));
            hr_set_face_normal(rec, r, outward_normal);
            return true;
        }
        iters += 1;
    }
    return false;
}

vec3 sc_ray_color(in Scene s, in Ray r) {
    HitRecord rec;
    // if (sphere_hit(s.sphere, r, 0., 1./0.00000001, rec)) {
    //     vec3 dCoord = genDCoord(rec.p, size);
    //     float density = dCoordVal(int(dCoord.x), int(dCoord.y), int(dCoord.z), size);
    //     return 0.5 * (rec.normal + vec3(1., 1., 1.)) * rec.dm * density;
    // }
    if (rayFluidInteract(s.fc, r, 0., 1./0.00000001, rec)) {
        vec3 dCoord = genDCoord(s, rec.p);
        float density = dCoordVal(int(dCoord.x), int(dCoord.y), int(dCoord.z), size);
        float rand = rand1(g_seed);
        if (rand > density) {
            return normalize((rec.normal + vec3(1., 1., 1.)) * density);
        }
    }
    vec3 unit_dir = normalize(r.direction);
    float t = 0.5*(unit_dir.y + 1.0);
    return (1.0 - t) * vec3(1., 1., 1.) + t*vec3(0.5, 0.7, 1.0);
}

vec3 sc_col(inout Scene s, in vec2 res) {
    /*
        Initial implementation:
        Create a ray from the origin through the uv coords of the screen
        return the color provided by the ray_color function
    */

    init_rand(res.xy, u_time/10.);
    float aspect_ratio = res.x / res.y;
    float viewport_height = 2.;
    float viewport_width = aspect_ratio*viewport_height;
    float focal_length = 1.;

    vec3 origin = vec3(0., 0., 0.);
    vec3 horizontal = vec3(viewport_width, 0., 0.);
    vec3 vertical = vec3(0., viewport_height, 0.);
    vec3 lower_left_corner = origin - (horizontal/2.) - (vertical/2.) - vec3(0., 0., focal_length);

    vec2 uv = gl_FragCoord.xy / res.xy;
    float u = uv.x;
    float v = uv.y;
    // fc_step(s.cube);
    Ray ray = Ray(origin, lower_left_corner + u*horizontal + v*vertical - origin);
    return sc_ray_color(s, ray);
}

void main() {
    Scene scene = sc_init();
    // highp float iTime = 0.;
    vec2 res = u_resolution;
    // iTime += u_time;
    vec3 col = sc_col(scene, res);
    // highp sampler2D density = u_density;
    gl_FragColor = vec4(col, 1.);
}
