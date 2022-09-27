uniform vec2 resolution;
uniform float time;
uniform vec3 mouse;
uniform vec3 baseColor;
// uniform sampler2D map;

// uses most of the StackGL methods
// https://github.com/stackgl

// https://github.com/hughsk/glsl-square-frame

vec2 squareFrame(vec2 screenSize) {
  vec2 position = 2.0 * (gl_FragCoord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}

// https://github.com/stackgl/glsl-look-at/blob/gh-pages/index.glsl

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));
  return mat3(uu, vv, ww);
}

// https://github.com/stackgl/glsl-camera-ray

vec3 getRay(mat3 camMat, vec2 screenPos, float lensLength) {
  return normalize(camMat * vec3(screenPos, lensLength));
}
vec3 getRay(vec3 origin, vec3 target, vec2 screenPos, float lensLength) {
  mat3 camMat = calcLookAtMatrix(origin, target, 0.0);
  return getRay(camMat, screenPos, lensLength);
}

/////////////////////////////////////////////////////////////////////////

//  og

mat3 rotationMatrix3(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
}

/////////////////////////////////////////////////////////////////////////

// primitives

// vec2 sphere(vec3 p, float radius, vec3 pos, vec4 quat) {
//   mat3 transform = rotationMatrix3(quat.xyz, quat.w);
//   float d = length((p * transform) - pos) - radius;
//   return vec2(d, 1);
// }

vec2 roundBox(vec3 p, vec3 size, float corner, vec3 pos, vec4 quat) {
  mat3 transform = rotationMatrix3(quat.xyz, quat.w);
  return vec2(length(max(abs((p - pos) * transform) - size, 0.0)) - corner, 1.0);
}

vec2 torus(vec3 p, vec2 radii, vec3 pos, vec4 quat) {
  mat3 transform = rotationMatrix3(quat.xyz, quat.w);
  vec3 pp = (p - pos) * transform;
  float d = length(vec2(length(pp.xz) - radii.x, pp.y)) - radii.y;
  return vec2(d, 1.0);
}

// vec2 cone(vec3 p, vec2 c, vec3 pos, vec4 quat) {
//   mat3 transform = rotationMatrix3(quat.xyz, quat.w);
//   vec3 pp = (p - pos) * transform;
//   float q = length(pp.xy);
//   return vec2(dot(c, vec2(q, pp.z)), 1.0);
// }

// // http://www.pouet.net/topic.php?post=365312
// vec2 cylinder(vec3 p, float h, float r, vec3 pos, vec4 quat) {
//   mat3 transform = rotationMatrix3(quat.xyz, quat.w);
//   vec3 pp = (p - pos) * transform;
//   return vec2(max(length(pp.xz) - r, abs(pp.y) - h), 1.0);
// }

// operations

// vec2 unionAB(vec2 a, vec2 b) {
//   return vec2(min(a.x, b.x), 1.0);
// }
// vec2 intersectionAB(vec2 a, vec2 b) {
//   return vec2(max(a.x, b.x), 1.0);
// }
// vec2 blendAB(vec2 a, vec2 b, float t) {
//   return vec2(mix(a.x, b.x, t), 1.0);
// }
// vec2 subtract(vec2 a, vec2 b) {
//   return vec2(max(-a.x, b.x), 1.0);
// }

// http://iquilezles.org/www/articles/smin/smin.htm
vec2 smin(vec2 a, vec2 b, float k) {
  float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0);
  return vec2(mix(b.x, a.x, h) - k * h * (1.0 - h), 1.0);
}

// utils

// http://www.pouet.net/topic.php?post=367360

const vec3 pa = vec3(1.0, 57.0, 21.0);
const vec4 pb = vec4(0.0, 57.0, 21.0, 78.0);
float perlin(vec3 p) {
  vec3 i = floor(p);
  vec4 a = dot(i, pa) + pb;
  vec3 f = cos((p - i) * acos(-1.0)) * (-.5) + 0.5;
  a = mix(sin(cos(a) * a), sin(cos(1.0 + a) * (1.0 + a)), f.x);
  a.xy = mix(a.xz, a.yw, f.y);
  return mix(a.x, a.y, f.z);
}

/////////////////////////////////////////////////////////////////////////

// STOP ! ! !

// HAMMER TIME !

/////////////////////////////////////////////////////////////////////////

const int steps = 50;
// const int shadowSteps = 4;
// const int ambienOcclusionSteps = 20;
// const float PI = 3.14159;
vec2 field(vec3 position) {

  // position
  // vec3 zero = vec3(0.0);

  // rotation
  float mouseDamping = 0.275;

  float mouseX = (mouse.x * mouseDamping);
  float mouseY = (mouse.y * mouseDamping);
  float mouseD = (mouse.z * (mouseDamping * mouseDamping * mouseDamping * mouseDamping * mouseDamping * mouseDamping));

  // float mouseXT = mouseX + time * 0.15;
//   float mouseYT = mouseY + time * 0.15;
  float mouseDT = mouseD + time * 0.15;

  // vec4 mouseQuat = vec4(1.0, sin(mouseDT) * 0.1, 0.0, (mouseDT) * 0.2);

  vec4 quat = vec4(1.0, sin(time * 0.15) * 0.1, 0.0, time * 0.15);

  // noise
  vec3 noise = position * 0.25;

  noise += time * 0.1;
  float pnoise = 1.0 + perlin(noise);

  float xBase = (resolution.x / 800.0);

  // vec2 torus1 = torus(position, vec2(4.5, 0.7), vec3(xBase, 6.0, 0.0), (quat + 2.5) * 0.8);
  vec2 torus2 = torus(position, vec2(5.0, 0.8), vec3(xBase, 0.0, 0.0), vec4(1.0 + mouseY, 3.0, 1.0 + mouseX, mouseDT));
  // vec2 torus3 = torus(position, vec2(4.5, 0.7), vec3(xBase, -6.0, 0.0), (quat + 1.0) * 0.8);

  vec2 cube1 = roundBox(position, vec3(2.0), 0.5, vec3(xBase - 2.5, 6.5, 0.0), quat);
  // vec2 cube2 = roundBox(position, vec3(1.5), 0.5, vec3(xBase, 0.0, 0.0), quat);
  vec2 cube3 = roundBox(position, vec3(2.0), 0.5, vec3(xBase + 2.5, -6.5, 0.0), quat);

  vec2 fig1 = cube1;
  vec2 fig2 = torus2;
  vec2 fig3 = cube3;

  return smin(fig3, smin(fig1, fig2, pnoise * 2.75), pnoise * 2.75);
}

/////////////////////////////////////////////////////////////////////////

// the methods below this need the field function

/////////////////////////////////////////////////////////////////////////

// the actual raymarching from:
// https://github.com/stackgl/glsl-raytrace/blob/master/index.glsl

vec2 raymarching(vec3 rayOrigin, vec3 rayDir, float maxd, float precis) {

  float latest = precis * 2.0;
  float dist = 0.0;
  float type = -1.0;
  vec2 res = vec2(-1.0, -1.0);
  for(int i = 0; i < steps; i++) {

    if(latest < precis || dist > maxd)
      break;

    vec2 result = field(rayOrigin + rayDir * dist);
    latest = result.x;
    type = result.y;
    dist += latest;
  }

  if(dist < maxd) {
    res = vec2(dist, type);
  }
  return res;
}

// https://github.com/stackgl/glsl-sdf-normal

vec3 calcNormal(vec3 pos, float eps) {
  const vec3 v1 = vec3(1.0, -1.0, -1.0);
  const vec3 v2 = vec3(-1.0, -1.0, 1.0);
  const vec3 v3 = vec3(-1.0, 1.0, -1.0);
  const vec3 v4 = vec3(1.0, 1.0, 1.0);

  return normalize(v1 * field(pos + v1 * eps).x +
    v2 * field(pos + v2 * eps).x +
    v3 * field(pos + v3 * eps).x +
    v4 * field(pos + v4 * eps).x);
}

vec3 calcNormal(vec3 pos) {
  return calcNormal(pos, 0.002);
}

// shadows & AO

// https://www.shadertoy.com/view/Xds3zN

// float softshadow(in vec3 ro, in vec3 rd, in float mint, in float tmax, in float K) {
//   float res = 1.0;
//   float t = mint;
//   for(int i = 0; i < shadowSteps; i++) {
//     float h = field(ro + rd * t).x;
//     res = min(res, K * h / t);
//     t += clamp(h, 0.02, 0.10);
//     if(h < 0.001 || t > tmax)
//       break;
//   }

//   return clamp(res, 0.0, 1.0);
// }

// float calcAO(in vec3 pos, in vec3 nor) {

//   float occ = 0.0;
//   float sca = 1.0;

//   for(int i = 0; i < ambienOcclusionSteps; i++) {
//     float hr = 0.01 + 0.12 * float(i) / float(ambienOcclusionSteps);
//     vec3 aopos = nor * hr + pos;
//     float dd = field(aopos).x;
//     occ += -(dd - hr) * sca;
//     sca *= 0.95;
//   }

//   return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
// }

// vec3 rimlight(vec3 pos, vec3 nor) {
//   vec3 v = normalize(-pos);
//   float vdn = 1.0 - max(dot(v, nor), 0.0);

//   return vec3(smoothstep(0.0, 1.0, vdn));
// }

void main() {

  vec3 color0 = baseColor;
  // vec3 color0 = vec3(0.89, 0.87, 0.82);
  // vec3 color1 = vec3(0.67, 0.65, 0.61);

  // Background color
  // vec2 xy = gl_FragCoord.xy / resolution;
  // gl_FragColor = vec4(mix(color0, color1, sin(xy.y + 0.5)) * 2., 1.);

  float cameraAngle = 0.0; // 0.8 * time;
  float cameraRadius = 20.0;

  vec2 screenPos = squareFrame(resolution);
  float lensLength = 2.5;
  vec3 rayOrigin = vec3(cameraRadius * sin(cameraAngle), 0.0, cameraRadius * cos(cameraAngle));
  vec3 rayTarget = vec3(0, 0, 0);
  vec3 rayDirection = getRay(rayOrigin, rayTarget, screenPos, lensLength);

  float maxDist = 50.0;
  vec2 collision = raymarching(rayOrigin, rayDirection, maxDist, 0.01);

  if(collision.x > -0.5) {

    // "world" position
    vec3 pos = rayOrigin + rayDirection * collision.x;

    // diffuse color
    vec3 colorDiffuse = color0 * 1.0;

    // normal vector
    vec3 nor = calcNormal(pos);

    // reflection (Spherical Environment Mapping)
    // vec2 uv = nor.xy / 2.0 + 0.5;
    // vec3 tex = texture2D(map, uv).rgb;
    // float textureStrength = 0.0;
    // colorDiffuse += tex * (0.1 * textureStrength);

    // vec3 lig0 = normalize(vec3(-0.5, 0.75, -0.5));
    // vec3 light0 = max(0.0, dot(lig0, nor)) * color0;

    // vec3 lig1 = normalize(vec3(0.5, -0.75, 0.5));
    // vec3 light1 = max(0.0, dot(lig1, nor)) * color1;

    // vec3 lightColor = color0 * 0.025 + ((color0.x + color0.y + color0.x) / 6.0);
    vec3 lightColor = color0 * (1.0 / (color0.x + color0.y + color0.x) / 15.0);
    vec3 lightPos = vec3(0.0, 1.0, 2.0);
    vec3 light = max(0.0, dot(lightPos, nor)) * lightColor;

    // AO : usually too strong
    // float occ = calcAO(pos, nor);

    // with shadows 0...?
    // float sha = softshadow(pos, lig0, 0.025, 2.5, 2.0);
    // float dep = ((collision.x + 0.5) / (maxDist * 0.5)) + sha;

    // w/o soft shadows
    // float dep = ((collision.x + 1.0) / (maxDist * 0.5));

    // Material color
    // gl_FragColor = vec4((colorDiffuse + light0 + light1) * occ * dep, 1.0);
    // gl_FragColor = vec4((colorDiffuse + light) * dep, 1.0);
    gl_FragColor = vec4((colorDiffuse + light), 1.0);

    // Stronger light
    // vec3 rim1 = rimlight(pos, -lig1);
    // gl_FragColor = vec4((rim1 + colorDiffuse + light0 + light1) * occ * dep, 1.0);
  }
}
