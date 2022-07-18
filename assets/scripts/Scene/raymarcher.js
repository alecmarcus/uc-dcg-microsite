import * as THREE from "three";

const fragment = `
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform sampler2D map;

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

mat3 rotationMatrix3(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
}

/////////////////////////////////////////////////////////////////////////

// primitives

vec2 sphere(vec3 p, float radius, vec3 pos, vec4 quat) {
  mat3 transform = rotationMatrix3(quat.xyz, quat.w);
  float d = length((p * transform) - pos) - radius;
  return vec2(d, 1);
}

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

vec2 cone(vec3 p, vec2 c, vec3 pos, vec4 quat) {
  mat3 transform = rotationMatrix3(quat.xyz, quat.w);
  vec3 pp = (p - pos) * transform;
  float q = length(pp.xy);
  return vec2(dot(c, vec2(q, pp.z)), 1.0);
}

// http://www.pouet.net/topic.php?post=365312
vec2 cylinder(vec3 p, float h, float r, vec3 pos, vec4 quat) {
  mat3 transform = rotationMatrix3(quat.xyz, quat.w);
  vec3 pp = (p - pos) * transform;
  return vec2(max(length(pp.xz) - r, abs(pp.y) - h), 1.0);
}

// operations

vec2 unionAB(vec2 a, vec2 b) {
  return vec2(min(a.x, b.x), 1.0);
}
vec2 intersectionAB(vec2 a, vec2 b) {
  return vec2(max(a.x, b.x), 1.0);
}
vec2 blendAB(vec2 a, vec2 b, float t) {
  return vec2(mix(a.x, b.x, t), 1.0);
}
vec2 subtract(vec2 a, vec2 b) {
  return vec2(max(-a.x, b.x), 1.0);
}

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
const int shadowSteps = 4;
const int ambienOcclusionSteps = 20;
const float PI = 3.14159;
vec2 field(vec3 position) {

  // position
  vec3 zero = vec3(0.0);

  // rotation
  vec4 quat = vec4(1.0, sin(time) * 0.1, 0.0, time * 0.2);

  // noise
  vec3 noise = position * 0.25;

  noise += time * 0.1;
  float pnoise = 1.0 + perlin(noise);

  vec2 torus1 = torus(position, vec2(5.0, 0.4), vec3(8.0, 6.0, 0.0), (quat + 2.5) * 0.8);
  vec2 torus2 = torus(position, vec2(5.0, 0.4), vec3(6.0, 0.0, 0.0), vec4(5.0 + mouse.x, mouse.x, time, time));
  vec2 torus3 = torus(position, vec2(5.0, 0.4), vec3(4.0, -6.0, 0.0), (quat + 1.0) * 0.8);

  vec2 cube1 = roundBox(position, vec3(1.5), 0.5, vec3(8.0, 6.0, 0.0), quat);
  vec2 cube2 = roundBox(position, vec3(1.5), 0.5, vec3(7.0, 0.0, 0.0), quat);
  vec2 cube3 = roundBox(position, vec3(1.5), 0.5, vec3(6.0, -6.0, 0.0), quat);

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

float softshadow(in vec3 ro, in vec3 rd, in float mint, in float tmax, in float K) {
  float res = 1.0;
  float t = mint;
  for(int i = 0; i < shadowSteps; i++) {
    float h = field(ro + rd * t).x;
    res = min(res, K * h / t);
    t += clamp(h, 0.02, 0.10);
    if(h < 0.001 || t > tmax)
      break;
  }

  return clamp(res, 0.0, 1.0);
}

float calcAO(in vec3 pos, in vec3 nor) {

  float occ = 0.0;
  float sca = 1.0;

  for(int i = 0; i < ambienOcclusionSteps; i++) {
    float hr = 0.01 + 0.12 * float(i) / float(ambienOcclusionSteps);
    vec3 aopos = nor * hr + pos;
    float dd = field(aopos).x;
    occ += -(dd - hr) * sca;
    sca *= 0.95;
  }

  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

vec3 rimlight(vec3 pos, vec3 nor) {
  vec3 v = normalize(-pos);
  float vdn = 1.0 - max(dot(v, nor), 0.0);

  return vec3(smoothstep(0.0, 1.0, vdn));
}

void main() {

  vec3 color0 = vec3(0.89, 0.87, 0.82);
  vec3 color1 = vec3(0.67, 0.65, 0.61);

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

    vec3 lightColor = color0 * 0.025;
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
}`;

const RayMarcher = (function () {
  const tl = new THREE.TextureLoader();
  const cl = new THREE.CubeTextureLoader();
  const mouse = new THREE.Vector2();

  function RayMarcher(distance, precision) {
    this.distance = distance || 50;
    this.precision = precision || 0.01;

    //scene setup

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    this.domElement = this.renderer.domElement;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.resolution = new THREE.Vector2(this.width, this.height);
    this.setSize(this.width, window.innerHeight);

    //geometry setup

    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
        ]),
        3,
      ),
    );
    this.mesh = new THREE.Mesh(this.geom, null);
    this.scene.add(this.mesh);

    // cameras

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1);
    this.target = new THREE.Vector3();

    //used only to render the scene

    this.renderCamera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      1 / Math.pow(2, 53),
      1,
    );

    return this;
  }

  async function loadFragmentShader(callback) {
    this.loaded = false;

    this.setFragmentShader(fragment, callback);

    return this;
  }

  function setFragmentShader(fs, cb) {
    this.startTime = Date.now();
    this.mesh.material = this.material = new THREE.ShaderMaterial({
      uniforms: {
        resolution: {
          type: "v2",
          value: this.resolution,
        },
        mouse: { type: "v2", value: mouse },
        time: { type: "f", value: 0 },
        randomSeed: { type: "f", value: Math.random() },
        fov: { type: "f", value: 45 },
        camera: { type: "v3", value: this.camera.position },
        target: { type: "v3", value: this.target },
        raymarchMaximumDistance: { type: "f", value: this.distance },
        raymarchPrecision: { type: "f", value: this.precision },
      },
      vertexShader: "void main() {gl_Position =  vec4( position, 1.0 );}",
      fragmentShader: fs,
      transparent: true,
    });
    this.update();

    if (cb != null) cb(this);
    this.loaded = true;
    return this;
  }

  function setTexture(name, url) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }
    rm.loaded = false;

    var scope = this;
    this.material.uniforms[name] = { type: "t", value: null };
    tl.load(url, function (texture) {
      scope.material.uniforms[name].value = texture;
      scope.material.needsUpdate = true;
      scope.loaded = true;
      texture.needsUpdate = true;
    });
    return this;
  }

  function setCubemap(name, urls) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }
    rm.loaded = false;

    var scope = this;
    this.material.uniforms[name] = { type: "t", value: null };
    cl.load(urls, function (texture) {
      scope.material.uniforms[name].value = texture;
      scope.material.needsUpdate = true;
      scope.loaded = true;
      texture.needsUpdate = true;
    });
  }

  function setUniform(name, type, value) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }

    this.material.uniforms[name] = { type: type, value: value };
    return this;
  }

  function getUniform(name) {
    if (this.material == null) {
      console.warn(
        "raymarcher.getUniform: material not initialized, use setFragmentShader() first.",
      );
      return null;
    }

    return this.material.uniforms[name];
  }

  function setSize(width, height) {
    this.width = width;
    this.height = height;

    this.resolution.set(width, height);

    this.renderer.setSize(width, height);

    return this;
  }

  function update() {
    const needResize =
      this.domElement.clientWidth !== window.innerWidth ||
      this.domElement.clientHeight !== window.innerHeight;

    if (needResize) {
      this.setSize(window.innerWidth, window.innerHeight);
    }

    if (this.material == null) return;

    this.material.uniforms.resolution.value.x =
      this.width * window.devicePixelRatio;
    this.material.uniforms.resolution.value.y =
      this.height * window.devicePixelRatio;

    this.material.uniforms.time.value = (Date.now() - this.startTime) * 0.001;
    this.material.uniforms.randomSeed.value = Math.random();

    this.material.uniforms.fov.value = (this.camera.fov * Math.PI) / 180;

    this.material.uniforms.raymarchMaximumDistance.value = this.distance;
    this.material.uniforms.raymarchPrecision.value = this.precision;

    this.material.uniforms.camera.value = this.camera.position;

    this.material.uniforms.target.value = this.target;
    this.camera.lookAt(this.target);
  }

  function render() {
    if (this.loaded) {
      this.update();

      this.renderer.render(this.scene, this.renderCamera);
    }
  }

  var _p = RayMarcher.prototype;
  _p.constructor = RayMarcher;

  _p.loadFragmentShader = loadFragmentShader;
  _p.setFragmentShader = setFragmentShader;
  _p.setTexture = setTexture;
  _p.setCubemap = setCubemap;
  _p.setUniform = setUniform;
  _p.getUniform = getUniform;
  _p.setSize = setSize;
  _p.update = update;
  _p.render = render;

  return RayMarcher;
})();

export default RayMarcher;
