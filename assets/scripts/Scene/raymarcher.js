import * as THREE from "three";

import fragmentURL from "url:./fragment.glsl";

const RayMarcher = (function () {
  const tl = new THREE.TextureLoader();
  const cl = new THREE.CubeTextureLoader();
  const mouse = new THREE.Vector3();
  const baseColor = new THREE.Vector3();

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

    const fs = await (await fetch(fragmentURL)).text();

    this.setFragmentShader(fs, callback);

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
        mouse: { type: "v3", value: mouse },
        baseColor: { type: "v3", value: baseColor },
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

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;

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
