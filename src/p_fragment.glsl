#include "sphere.glsl"
#include "common.glsl"
#include "sdf.glsl"

varying vec3 pos;
uniform vec2 u_resolution;
uniform highp float u_time;
uniform int u_num_particles;
uniform sampler2D u_particles_x;
uniform sampler2D u_particles_y;
uniform sampler2D u_particles_z;
uniform highp float u_particle_size;
uniform highp vec3 u_cube_pos;
uniform highp mat4 u_cube_rot;
uniform highp vec3 u_cube_dims;
uniform vec3 u_half_dims;

struct Scene {
    Sphere sphere;
};

Scene sc_init() {
    Sphere sphere = Sphere(vec3(0., 0., -1.), 0.5);
    return Scene(
        sphere
    );
}

float sdPointSampleMin(in vec3 p, inout vec3 normal) {
    float bestSdf = 1e5;

    for (int i = 0; i < u_num_particles; i ++) {
        float xV = texture2D(u_particles_x, vec2(i, 0)).x *(2. * u_half_dims.x) - u_half_dims.x + u_cube_pos.x;
        float yV = texture2D(u_particles_y, vec2(i, 0)).x *(2. * u_half_dims.y) - u_half_dims.y + u_cube_pos.y;
        float zV = texture2D(u_particles_z, vec2(i, 0)).x*(2. * u_half_dims.z) - u_half_dims.z + u_cube_pos.z;
        float r = u_particle_size;
        vec3 center = vec3(xV, yV, zV);
        float dist = opSmoothUnion(sdSphere(p - (center), r), bestSdf, 0.1);
        if (dist < bestSdf) {
            bestSdf = dist;
            normal = normalize((p - center) / r);
        }
    }
    return bestSdf;
}

bool raySphereFieldInteract(in Ray r, inout HitRecord rec) {
    Sphere s = Sphere(u_cube_pos, u_half_dims.x * 2.);
    if (!sphere_hit(s, r, 0., 1./0.00000000001, rec)) return false;
    int iters = 1;
    int max_iter = 200;
    vec3 loc = r.origin;
    bool hit = false;
    float step_size = 1.;
    while (!hit && iters < max_iter) {
        vec3 normal = vec3(1.);
        step_size = sdPointSampleMin(loc, normal);
        loc = loc + r.direction * step_size;
        if (step_size < EPSILON) {
            rec.p = loc;
            rec.normal = normalize(normal);
            rec.t = step_size;
            hit = true;
            return true;
        }
        iters += 1;
    }
    return false;
}

bool rayCubeFieldInteract(in Ray r) {
    int iters = 1;
    int max_iter = 10;
    vec3 loc = r.origin;
    bool hit = false;
    float step_size = 1.;
    while (!hit && iters < max_iter) {
        vec3 normal = vec3(1.);
        step_size = sdBox(loc - u_cube_pos, u_half_dims);
        loc = loc + r.direction * step_size;
        if (step_size < EPSILON) {
            return true;
        }
        iters += 1;
    }
    return false;
}

vec3 sc_ray_color(in Scene s, in Ray r, in float time) {
    HitRecord rec;
    if (rayCubeFieldInteract(r) && raySphereFieldInteract(r, rec)) {
        return normalize(0.5 * (rec.normal + vec3(1., 1., 1.)));
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

    init_rand(res.xy, u_time);
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
    Ray ray = Ray(origin, lower_left_corner + u*horizontal + v*vertical - origin);
    return sc_ray_color(s, ray, u_time);
}

void main() {
    Scene scene = sc_init();
    vec2 res = u_resolution;
    vec3 col = sc_col(scene, res);
    gl_FragColor = vec4(col, 1.);
}
