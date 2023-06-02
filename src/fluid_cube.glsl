struct FluidCube {
    vec3 center;
    int subdiv;
    float scale;
    mat4 rotation;
};

mat4 fc_transform(in FluidCube c) {
    mat4 translate = mat4(
        vec4(1., 0., 0., 0.),
        vec4(0., 1., 0., 0.),
        vec4(0., 0., 1., 0.),
        vec4(c.center, 1.)
    );
    return translate * c.rotation;
}

float fc_sd(in FluidCube c, in vec3 loc) {
    vec3 half_bounds = vec3(c.scale * float(c.subdiv) / 2.);
    vec3 p = (inverse(fc_transform(c)) * vec4(loc, 1.)).xyz;

    return length(max(abs(p)-half_bounds,0.0));

    float d = 0.;
    if (abs(p.x) < half_bounds.x && abs(p.y) < half_bounds.y && abs(p.z) < half_bounds.z) {
        return max(max(abs(p.x) - half_bounds.x, abs(p.y) - half_bounds.y), abs(p.z) - half_bounds.z);
    } else if (abs(p.x) < half_bounds.x) {
        if (abs(p.y) < half_bounds.y) {
            d = abs(p.z) - half_bounds.z;
        } else {
            if (abs(p.z) < half_bounds.z) {
                d = abs(p.y) - half_bounds.y;
            } else {
                d = length(vec2(abs(p.y) - half_bounds.y, abs(p.z) - half_bounds.z));
            }
        }
    } else if (abs(p.y) <= half_bounds.y) {
        if (abs(p.z) <= half_bounds.z) {
            d = abs(p.x) - half_bounds.x;
        } else {
            d = length(vec2(abs(p.x) - half_bounds.x, abs(p.z) - half_bounds.z));
        }
    } else {
        if (abs(p.z) <= half_bounds.z) {
            d = length(vec2(abs(p.x) - half_bounds.x, abs(p.y) - half_bounds.y));
        } else {
            d = length(vec3(abs(p.x) - half_bounds.x, abs(p.y) - half_bounds.y, abs(p.z) - half_bounds.z));
        }
    }
    return d;
}

vec3 fc_subdiv(in FluidCube cube, in vec3 point) {
    int N = cube.subdiv;
    // naive -> improve to binary search later
    vec3 bottomLeft = cube.center - vec3(float(N)*cube.scale / 2.);
    for (int i = 0; i < N; i ++) {
        for (int j = 0; j < N; j ++) {
            for (int k = 0; k < N; k ++) {
                float xLB = bottomLeft.x + (cube.scale * float(i)) + cube.scale * 0.;
                float xGB = bottomLeft.x + (cube.scale * float(i)) + cube.scale * 1.0;
                float yLB = bottomLeft.y + (cube.scale * float(j)) + cube.scale * 0.;
                float yGB = bottomLeft.y + (cube.scale * float(j)) + cube.scale * 1.0;
                float zLB = bottomLeft.z + (cube.scale * float(k)) + cube.scale * 0.;
                float zGB = bottomLeft.z + (cube.scale * float(k)) + cube.scale * 1.0;
                if (point.x > xLB && point.x < xGB && point.y > yLB && point.y < yGB && point.z > zLB && point.z < zGB) {
                    return vec3(0., 0., 0.);
                }
            }
        }
    }
    return vec3(0.);
}