#define SPHERE 0
#define BOX 1
#define CYLINDER 3
#define CONE 5
#define NONE 4

////////////////////////////////////////////////////
// TASK 1 - Write up your SDF code here:
////////////////////////////////////////////////////

// returns the signed distance to a sphere from position p
float sdSphere(vec3 p, float r)
{
    return length(p) - r;
}

//
// Task 1.1
//
// Returns the signed distance to a line segment.
//
// p is the position you are evaluating the distance to.
// a and b are the end points of your line.
//
float sdLine(in vec2 p, in vec2 a, in vec2 b)
{
    vec2 line = b - a;
    vec2 unitLine = normalize(line);
    vec2 ap = p - a;
    vec2 proj = a + unitLine * dot(unitLine, ap);
    float rawDist = distance(p, proj);
    if (distance(a, proj) > length(line) || distance(b, proj) > length(line)) {
        float aDist = distance(p, a);
        float bDist = distance(p, b);
        return min(aDist, bDist);
    }
    return rawDist;
}

float lineDist3D(in vec3 p, in vec3 a, in vec3 b) {
    vec3 line = b - a;
    vec3 unitLine = normalize(line);
    vec3 ap = p - a;
    vec3 proj = a + unitLine * dot(unitLine, ap);
    float rawDist = distance(p, proj);
    if (distance(a, proj) > length(line) || distance(b, proj) > length(line)) {
        float aDist = distance(p, a);
        float bDist = distance(p, b);
        return min(aDist, bDist);
    }
    return rawDist;
}

float sdBox(vec3 p, vec3 half_bounds)
{
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


float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{

    vec3 ap = p - a;
    vec3 unitLine = normalize(b-a);
    vec3 proj = a + unitLine * dot(unitLine, ap);
    vec3 midpoint = a + 0.5*(b - a);
    vec3 axisDir = midpoint + normalize(b - a);

    float radialDist = distance(p, proj);
    float height = dot(axisDir, p - midpoint);

    if (radialDist > r && abs(height) > length(0.5* (b-a))) {
        vec3 planePoint = p - abs(height)*axisDir;
        vec3 aPlanePoint = planePoint - (a-b)*0.5;
        vec3 bPlanePoint = planePoint + (b-a)*0.5;
        vec3 aCircPoint = a + normalize(aPlanePoint - a)*r;
        vec3 bCircPoint = b + normalize(bPlanePoint - b)*r;
        return min(distance(p, aCircPoint), distance(p, bCircPoint));
    } else if (radialDist > r) {
        return radialDist - r;
    } else if (abs(height) > length(0.5* (b-a))) {
        return abs(height) - length(0.5* (b-a));
    } else {
        return max(abs(height) - length(0.5* (b-a)), radialDist - r);
    }
}

float sdCone(vec3 p, vec3 a, vec3 b, float ra, float rb)
{
    vec3 ap = p - a;
    vec3 unitLine = normalize(b-a);
    vec3 proj = a + unitLine * dot(unitLine, ap);
    vec3 midpoint = a + 0.5*(b - a);
    vec3 axisDir = midpoint + normalize(b - a);

    float radialDist = distance(p, proj);
    float height = dot(axisDir, p - midpoint);
    float rt = (height + 0.5*distance(a, b)/distance(a, b));
    float r = rt * (rb - ra) + ra;

    if (radialDist > r && abs(height) > length(0.5* (b-a))) {
        vec3 planePoint = p - abs(height)*axisDir;
        vec3 aPlanePoint = planePoint - (a-b)*0.5;
        vec3 bPlanePoint = planePoint + (b-a)*0.5;
        vec3 aCircPoint = a + normalize(aPlanePoint - a)*r;
        vec3 bCircPoint = b + normalize(bPlanePoint - b)*r;
        return min(distance(p, aCircPoint), distance(p, bCircPoint));
    } else if (radialDist > r) {
        return radialDist - r;
    } else if (abs(height) > length(0.5* (b-a))) {
        return abs(height) - length(0.5* (b-a));
    } else {
        return max(abs(height) - length(0.5* (b-a)), radialDist - r);
    }
}

// Task 1.5
float opSmoothUnion(float d1, float d2, float k)
{
    float h = max(k - abs(d2 - d1), 0.);
    return min(d1, d2) - pow(h, 2.)/(4.*k);
}

// Task 1.6
float opSmoothSubtraction(float d1, float d2, float k)
{
    float h = max(k - abs(d2 + d1), 0.);
    return max(-d1, d2) + pow(h, 2.)/(4.*k);
}

// Task 1.7
float opSmoothIntersection(float d1, float d2, float k)
{
    float h = max(k - abs(d2 - d1), 0.);
    return max(d1, d2) + pow(h, 2.)/(4.*k);
}

// Task 1.8
float opRound(float d, float iso)
{
    return d - iso;
}



////////////////////////////////////////////////////
// FOR TASK 3 & 4
////////////////////////////////////////////////////

#define TASK3 3
#define TASK4 4
#define TASK5 5

//
// Render Settings
//
struct settings
{
    int sdf_func;      // Which primitive is being visualized (e.g. SPHERE, BOX, etc.)
    int shade_mode;    // How the primiive is being visualized (GRID or COST)
    int marching_type; // Should we use RAY_MARCHING or SPHERE_TRACING?
    int task_world;    // Which task is being rendered (TASK3 or TASK4)?
    float anim_speed;  // Specifies the animation speed
};

// returns the signed distance to an infinite plane with a specific y value
float sdPlane(vec3 p, float z)
{
    return p.y - z;
}

float world_sdf(vec3 p, float time, settings setts)
{
    if (setts.task_world == TASK3)
    {
        if ((setts.sdf_func == SPHERE) || (setts.sdf_func == NONE))
        {
            return min(sdSphere(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), 0.4f), sdPlane(p, 0.f));
        }
        if (setts.sdf_func == BOX)
        {
            return min(sdBox(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(0.4f)), sdPlane(p, 0.f));
        }
        if (setts.sdf_func == CYLINDER)
        {
            return min(sdCylinder(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(0.0f, -0.4f, 0.f),
                                  vec3(0.f, 0.4f, 0.f), 0.2f),
                       sdPlane(p, 0.f));
        }
        if (setts.sdf_func == CONE)
        {
            return min(sdCone(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(-0.4f, 0.0f, 0.f),
                              vec3(0.4f, 0.0f, 0.f), 0.1f, 0.6f),
                       sdPlane(p, 0.f));
        }
    }

    if (setts.task_world == TASK4)
    {
        float dist = 100000.0;

        dist = sdPlane(p.xyz, -0.3);
        dist = opSmoothUnion(dist, sdSphere(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), 0.4f), 0.1);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(sin(time), 0.25 * cos(setts.anim_speed * time * 2. + 0.2), cos(time)), 0.2f), 0.01);
        dist = opSmoothSubtraction(sdBox(p - vec3(0.f, 0.25, 0.f), 0.1 * vec3(2. + cos(time))), dist, 0.2);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(sin(-time), 0.25 * cos(setts.anim_speed * time * 25. + 0.2), cos(-time)), 0.2f),
            0.1);

        return dist;
    }

    if (setts.task_world == TASK5)
    {
        float dist = 100000.0;

        dist = sdPlane(p.xyz, -0.3);
        dist = opSmoothUnion(dist, sdBox(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.4), vec3(0.2, 0.2, 0.2)), 0.01);
        dist = opSmoothUnion(dist, sdBox(p - vec3(1.f, 0.25 * sin(setts.anim_speed * time), 0.4), vec3(0.1, 0.1, 0.1)), 0.01);
        dist = opRound(dist, 0.1);
        dist = opSmoothSubtraction(sdBox(p - vec3(0.f, 0.25, 0.f), 0.1 * vec3(2. + cos(time))), dist, 0.2);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(sin(-time), 0.25 * cos(setts.anim_speed * time * 25. + 0.2), cos(-time)), 0.2f),
            0.1);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(cos(-time), 0.25 * cos(setts.anim_speed * time * 25. + 0.2), cos(-time)), 0.2f),
            0.1);


        return dist;
    }

    return 1.f;
}