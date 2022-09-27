import * as THREE from "three";

import fragmentURL from "url:./fragment.glsl";

class RayMarcher {
  tl = new THREE.TextureLoader();
  cl = new THREE.CubeTextureLoader();
  mouse = new THREE.Vector3();
  baseColor = new THREE.Vector3();
  distance = 40;
  precision = 0.01;
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ alpha: true });
  geom = new THREE.BufferGeometry();
  mesh = new THREE.Mesh(this.geom, null);
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1);
  target = new THREE.Vector3();
  renderCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );

  constructor() {
    window.addEventListener("resize", () => this.setSize());
    this.setSize();
    this.geom.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
        ]),
        3,
      ),
    );
    this.scene.add(this.mesh);
  }

  get domElement() {
    return this.renderer.domElement;
  }

  async loadFragmentShader(callback) {
    this.loaded = false;

    const fs = await (await fetch(fragmentURL)).text();

    this.setFragmentShader(fs, callback);

    return this;
  }

  setFragmentShader(fs, cb) {
    this.startTime = Date.now();
    this.mesh.material = this.material = new THREE.ShaderMaterial({
      uniforms: {
        resolution: {
          type: "v2",
          value: this.resolution,
        },
        mouse: { type: "v3", value: this.mouse },
        baseColor: { type: "v3", value: this.baseColor },
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

  setTexture(name, url) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }
    rm.loaded = false;

    var scope = this;
    this.material.uniforms[name] = { type: "t", value: null };
    this.tl.load(url, function (texture) {
      scope.material.uniforms[name].value = texture;
      scope.material.needsUpdate = true;
      scope.loaded = true;
      texture.needsUpdate = true;
    });
    return this;
  }

  setCubemap(name, urls) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }
    rm.loaded = false;

    var scope = this;
    this.material.uniforms[name] = { type: "t", value: null };
    this.cl.load(urls, function (texture) {
      scope.material.uniforms[name].value = texture;
      scope.material.needsUpdate = true;
      scope.loaded = true;
      texture.needsUpdate = true;
    });
  }

  setUniform(name, type, value) {
    if (this.material == null) {
      throw new Error(
        "material not initialized, use setFragmentShader() first.",
      );
    }

    this.material.uniforms[name] = { type: type, value: value };
    return this;
  }

  getUniform(name) {
    if (this.material == null) {
      console.warn(
        "raymarcher.getUniform: material not initialized, use setFragmentShader() first.",
      );
      return null;
    }

    return this.material.uniforms[name];
  }

  setSize() {
    if (window.innerWidth > window.innerHeight) {
      this.width = (window.innerWidth / 3) * 2;
      this.height = window.innerHeight;
    } else {
      this.width = (window.innerHeight / 3) * 2;
      this.height = window.innerHeight;
    }

    if (this.resolution) {
      this.resolution.set(this.width, this.height);
    } else {
      this.resolution = new THREE.Vector2(this.width, this.height);
    }

    this.renderer.setSize(this.width, this.height);

    return this;
  }

  update() {
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

  render() {
    if (this.loaded) {
      this.update();

      this.renderer.render(this.scene, this.renderCamera);
    }
  }
}

export default RayMarcher;
