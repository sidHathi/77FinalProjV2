#include "sphere.glsl"
#include "common.glsl"

uniform vec2 u_resolution;
uniform sampler2D u_density;

struct Scene {
    Sphere sphere;
};

float dCoordVal(int x, int y, int z, int N) {
    return texture2D(u_density, vec2(0., 0.)).x / 255.;
    // return texture2D(tex, vec2(x  +  y * N, z)).x / 255.;
}

Scene sc_init() {
    Sphere sphere = Sphere(vec3(0., 0., -1.), 0.5);
    return Scene(
        sphere
    );
}

vec3 genDCoord(vec3 loc, int subdivSize) {
    vec3 center = vec3(0., 0., -1.);
    float halfSideLength = 1.;
    if (abs(loc.x - center.x) > halfSideLength || abs(loc.y - center.y) > halfSideLength || abs(loc.z - center.z) > halfSideLength) {
        return vec3(0., 0., 0.);
    }

    // vec3 dif = loc - center;
    // float x = dif.x / (halfSideLength / (float(subdivSize) / 2.));
    // float y = dif.y / (halfSideLength / (float(subdivSize) / 2.));
    // float z = dif.z / (halfSideLength / (float(subdivSize) / 2.));
    float x = rand1(g_seed);
    float y = rand1(g_seed);
    float z = rand1(g_seed);
    return vec3(x, y, z);
}

vec3 sc_ray_color(in Scene s, in Ray r) {
    HitRecord rec;
    if (sphere_hit(s.sphere, r, 0., 1./0.00000001, rec)) {
        vec3 dCoord = genDCoord(rec.p, 512);
        float density = dCoordVal(int(dCoord.x), int(dCoord.y), int(dCoord.z), 512);
        float rand = rand1(g_seed);
        if (rand > 2*density) {
            return 0.5 * (rec.normal + vec3(1., 1., 1.)) * rec.dm * density;
        }
    }
    vec3 unit_dir = normalize(r.direction);
    float t = 0.5*(unit_dir.y + 1.0);
    return (1.0 - t) * vec3(1., 1., 1.) + t*vec3(0.5, 0.7, 1.0);
}

vec3 sc_col(inout Scene s, in float iTime) {
    /*
        Initial implementation:
        Create a ray from the origin through the uv coords of the screen
        return the color provided by the ray_color function
    */

    vec2 res = u_resolution.xy;
    init_rand(gl_FragCoord.xy, iTime);
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